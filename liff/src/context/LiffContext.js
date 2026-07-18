"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const LiffContext = createContext({
  liff: null,
  userProfile: null,
  isLoading: true,
  error: null,
});

const timeout = (ms, message) => 
  new Promise((_, reject) => setTimeout(() => reject(new Error(message || "Timeout")), ms));

export const LiffProvider = ({ children }) => {
  const [liffObject, setLiffObject] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const initLiff = async () => {
      try {
        const liffModule = await import("@line/liff");
        const liff = liffModule.default;
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

        if (!liffId) {
          throw new Error("NEXT_PUBLIC_LIFF_ID is not configured in .env.local.");
        }

        // Prevent double initialization in React Strict Mode (dev)
        if (window.__liffObject) {
          console.log("LIFF already initialized (cached)");
          if (isMounted) {
            setLiffObject(window.__liffObject);
            if (window.__liffProfile) {
              setUserProfile(window.__liffProfile);
            }
            setIsLoading(false);
          }
          return;
        }

        if (window.__liffInitializing) {
          console.log("LIFF is already initializing, waiting...");
          const checkInit = setInterval(() => {
            if (window.__liffObject) {
              clearInterval(checkInit);
              if (isMounted) {
                setLiffObject(window.__liffObject);
                if (window.__liffProfile) {
                  setUserProfile(window.__liffProfile);
                }
                setIsLoading(false);
              }
            }
          }, 100);
          return;
        }

        window.__liffInitializing = true;
        console.log("Initializing LIFF with ID:", liffId);

        // Run liff.init with a 6-second timeout to prevent indefinite hangs
        await Promise.race([
          liff.init({ liffId }),
          timeout(6000, "LIFF init timed out")
        ]);
        
        console.log("LIFF initialized successfully");
        window.__liffObject = liff;

        // Handle Login Flow
        if (!liff.isLoggedIn()) {
          console.log("User is not logged in. Redirecting to LINE login...");
          liff.login();
        } else {
          console.log("User is logged in. Fetching user profile...");
          try {
            // Run liff.getProfile with a 4-second timeout
            const profile = await Promise.race([
              liff.getProfile(),
              timeout(4000, "LIFF getProfile timed out")
            ]);
            console.log("User profile fetched:", profile);
            window.__liffProfile = profile;
            if (isMounted) {
              setUserProfile(profile);
            }
          } catch (profileErr) {
            console.warn("Failed to fetch user profile, using mock fallback profile:", profileErr.message);
            const fallbackProfile = {
              displayName: "LINE User (Profile Fallback)",
              userId: "fallback_user_id_" + Math.random().toString(36).substring(7),
              pictureUrl: "",
            };
            window.__liffProfile = fallbackProfile;
            if (isMounted) {
              setUserProfile(fallbackProfile);
            }
          }
        }

        window.__liffInitializing = false;
        if (isMounted) {
          setLiffObject(liff);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn("LIFF SDK failed to load. Falling back to Mock Developer Mode:", err.message);
        window.__liffInitializing = false;
        
        // In local development, fallback to mock mode to keep the developer productive
        if (isMounted) {
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
          
          setLiffObject(window.__liffObject);
          setUserProfile(mockProfile);
          setIsLoading(false);
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
      }}
    >
      {children}
    </LiffContext.Provider>
  );
};

export const useLiff = () => useContext(LiffContext);
