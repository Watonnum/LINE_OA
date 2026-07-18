"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const LiffContext = createContext({
  liff: null,
  userProfile: null,
  isLoading: true,
  error: null,
  steps: [],
});

const timeout = (ms, message) => 
  new Promise((_, reject) => setTimeout(() => reject(new Error(message || "Timeout")), ms));

// Singletons to share across multiple useEffect invocations (React 18/19 Strict Mode)
let liffInitPromise = null;
let liffProfilePromise = null;
let globalSteps = [];
let stepListeners = [];

const addGlobalStep = (msg) => {
  const time = new Date().toLocaleTimeString();
  const step = `${time}: ${msg}`;
  console.log("[LIFF-INIT]", step);
  globalSteps.push(step);
  stepListeners.forEach(listener => listener([...globalSteps]));
};

export const LiffProvider = ({ children }) => {
  const [liffObject, setLiffObject] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [steps, setSteps] = useState(() => [...globalSteps]);

  useEffect(() => {
    // Register listener for step changes
    const listener = (newSteps) => setSteps(newSteps);
    stepListeners.push(listener);

    return () => {
      stepListeners = stepListeners.filter(l => l !== listener);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initLiff = async () => {
      // Check for dev/mock mode parameter in URL
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const isMockMode = urlParams.get("mock") === "true" || urlParams.get("dev") === "true";

        if (isMockMode) {
          addGlobalStep("Mock Mode detected in URL query params.");
          const mockProfile = {
            displayName: "Dev Customer (Mock)",
            userId: "dev_mock_user_999",
            pictureUrl: "",
          };
          window.__liffObject = {
            isLoggedIn: () => true,
            getProfile: async () => mockProfile,
            login: () => console.log("Mock login called"),
          };
          window.__liffProfile = mockProfile;
          
          if (isMounted) {
            setLiffObject(window.__liffObject);
            setUserProfile(mockProfile);
            setIsLoading(false);
          }
          addGlobalStep("Mock Mode setup complete, loader removed.");
          return;
        }
      }

      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) {
          throw new Error("NEXT_PUBLIC_LIFF_ID is not configured in .env.local.");
        }

        // Initialize LIFF (singleton promise to avoid concurrent inits)
        if (!liffInitPromise) {
          addGlobalStep("Importing @line/liff dynamic module...");
          liffInitPromise = (async () => {
            const liffModule = await import("@line/liff");
            const liff = liffModule.default;
            addGlobalStep(`Initializing liff.init({ liffId: "${liffId}" })...`);
            
            await Promise.race([
              liff.init({ liffId }),
              timeout(8000, "LIFF init timed out (8s)")
            ]);
            return liff;
          })();
        }

        const liff = await liffInitPromise;
        addGlobalStep("liff.init() resolved successfully.");

        if (isMounted) {
          setLiffObject(liff);
        }

        // Check Login Status
        addGlobalStep("Checking liff.isLoggedIn()...");
        const loggedIn = liff.isLoggedIn();
        addGlobalStep(`liff.isLoggedIn() returned: ${loggedIn}`);

        if (!loggedIn) {
          addGlobalStep("User is not logged in. Calling liff.login()...");
          liff.login();
          // Stop execution since the browser is redirecting
          return;
        }

        // Fetch User Profile
        addGlobalStep("User is logged in. Fetching user profile...");
        if (!liffProfilePromise) {
          liffProfilePromise = (async () => {
            addGlobalStep("Calling liff.getProfile()...");
            const profile = await Promise.race([
              liff.getProfile(),
              timeout(6000, "LIFF getProfile timed out (6s)")
            ]);
            return profile;
          })();
        }

        const profile = await liffProfilePromise;
        addGlobalStep(`Profile fetched successfully: ${profile.displayName} (${profile.userId})`);

        if (isMounted) {
          setUserProfile(profile);
          setIsLoading(false);
          addGlobalStep("State updated, loader removed successfully.");
        }
      } catch (err) {
        addGlobalStep(`Error occurred during initialization: ${err.message}`);
        
        // Local dev fallback to Mock Mode if initialization fails or times out
        addGlobalStep("Falling back to Mock Developer Mode to prevent blocking...");
        if (isMounted) {
          const mockProfile = {
            displayName: "Dev Customer (Mock Fallback)",
            userId: "dev_mock_user_999",
            pictureUrl: "",
          };
          const mockLiff = {
            isLoggedIn: () => true,
            getProfile: async () => mockProfile,
            login: () => console.log("Mock login called"),
          };
          setLiffObject(mockLiff);
          setUserProfile(mockProfile);
          setIsLoading(false);
          addGlobalStep("Fallback profile applied, loader removed.");
        }
      }
    };

    initLiff();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <LiffContext.Provider
      value={{
        liff: liffObject,
        userProfile,
        isLoading,
        error,
        steps,
      }}
    >
      {children}
    </LiffContext.Provider>
  );
};

export const useLiff = () => useContext(LiffContext);
