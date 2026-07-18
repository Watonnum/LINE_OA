"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const LiffContext = createContext({
  liff: null,
  userProfile: null,
  isLoading: true,
  error: null,
});

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
          throw new Error("NEXT_PUBLIC_LIFF_ID is not configured. Please restart your Next.js server after adding it to .env.local.");
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
          // Wait for existing initialization to finish
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

        await liff.init({ liffId });
        console.log("LIFF initialized successfully");
        window.__liffObject = liff;

        // Handle Login Flow
        if (!liff.isLoggedIn()) {
          console.log("User is not logged in. Redirecting to LINE login...");
          liff.login();
        } else {
          console.log("User is logged in. Fetching user profile...");
          const profile = await liff.getProfile();
          console.log("User profile fetched:", profile);
          window.__liffProfile = profile;
          if (isMounted) {
            setUserProfile(profile);
          }
        }

        window.__liffInitializing = false;
        if (isMounted) {
          setLiffObject(liff);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("LIFF initialization error:", err);
        window.__liffInitializing = false;
        if (isMounted) {
          setError(err.message || "Failed to initialize LIFF");
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
