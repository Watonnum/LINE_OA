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
    // Dynamic import to avoid SSR errors in Next.js
    import("@line/liff")
      .then((liffModule) => {
        const liff = liffModule.default;
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        
        if (!liffId) {
          throw new Error("NEXT_PUBLIC_LIFF_ID is not configured in your environment files.");
        }

        console.log("Initializing LIFF with ID:", liffId);
        
        return liff.init({ liffId })
          .then(async () => {
            console.log("LIFF initialized successfully");
            setLiffObject(liff);

            // Handle Login Flow
            if (!liff.isLoggedIn()) {
              console.log("User is not logged in. Redirecting to LINE login...");
              liff.login();
            } else {
              console.log("User is logged in. Fetching user profile...");
              const profile = await liff.getProfile();
              console.log("User profile fetched:", profile);
              setUserProfile(profile);
            }
            setIsLoading(false);
          });
      })
      .catch((err) => {
        console.error("LIFF initialization failed:", err);
        setError(err.message || "Failed to initialize LIFF SDK");
        setIsLoading(false);
      });
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
