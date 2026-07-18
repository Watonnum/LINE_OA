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

// Shared singleton promises for React Strict Mode remounts
let liffInitPromise = null;
let liffProfilePromise = null;

export const LiffProvider = ({ children }) => {
  const [liffObject, setLiffObject] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [steps, setSteps] = useState([]);

  const addStep = (msg) => {
    const time = new Date().toLocaleTimeString();
    const stepLine = `${time}: ${msg}`;
    console.log("[LIFF-INIT]", stepLine);
    setTimeout(() => {
      setSteps((prev) => [...prev, stepLine]);
    }, 0);
  };

  console.log("LiffProvider rendered. isLoading:", isLoading, "steps count:", steps.length);

  useEffect(() => {
    console.log("LiffProvider useEffect triggered!");
    let isMounted = true;
    addStep("useEffect mounted. Starting initialization...");

    const initLiff = async () => {
      // Check for dev/mock mode parameter in URL
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const isMockMode = urlParams.get("mock") === "true" || urlParams.get("dev") === "true";

        if (isMockMode) {
          addStep("Mock Mode detected in URL query params.");
          const mockProfile = {
            displayName: "Dev Customer (Mock)",
            userId: "dev_mock_user_999",
            pictureUrl: "",
          };
          
          const mockLiff = {
            isLoggedIn: () => true,
            getProfile: async () => mockProfile,
            login: () => console.log("Mock login called"),
          };

          if (isMounted) {
            setLiffObject(mockLiff);
            setUserProfile(mockProfile);
            setIsLoading(false);
          }
          addStep("Mock Mode setup complete, loader removed.");
          return;
        }
      }

      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) {
          throw new Error("NEXT_PUBLIC_LIFF_ID is not configured in .env.local.");
        }

        // Initialize LIFF (singleton promise)
        if (!liffInitPromise) {
          addStep("Importing @line/liff dynamic module...");
          liffInitPromise = (async () => {
            const liffModule = await import("@line/liff");
            const liffInstance = liffModule.default;
            addStep(`Initializing liff.init({ liffId: "${liffId}" })...`);
            
            await Promise.race([
              liffInstance.init({ liffId }),
              timeout(8000, "LIFF init timed out (8s)")
            ]);
            return liffInstance;
          })();
        }

        const liff = await liffInitPromise;
        addStep("liff.init() resolved successfully.");

        if (isMounted) {
          setLiffObject(liff);
        }

        // Check Login Status
        addStep("Checking liff.isLoggedIn()...");
        const loggedIn = liff.isLoggedIn();
        addStep(`liff.isLoggedIn() returned: ${loggedIn}`);

        if (!loggedIn) {
          addStep("User is not logged in. Calling liff.login()...");
          liff.login();
          return;
        }

        // Fetch User Profile
        addStep("User is logged in. Fetching user profile...");
        if (!liffProfilePromise) {
          liffProfilePromise = (async () => {
            addStep("Calling liff.getProfile()...");
            const profile = await Promise.race([
              liff.getProfile(),
              timeout(6000, "LIFF getProfile timed out (6s)")
            ]);
            return profile;
          })();
        }

        const profile = await liffProfilePromise;
        addStep(`Profile fetched successfully: ${profile.displayName} (${profile.userId})`);

        if (isMounted) {
          setUserProfile(profile);
          setIsLoading(false);
          addStep("State updated, loader removed successfully.");
        }
      } catch (err) {
        addStep(`Error occurred during initialization: ${err.message}`);
        addStep("Falling back to Mock Developer Mode to prevent blocking...");
        
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
          addStep("Fallback profile applied, loader removed.");
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
