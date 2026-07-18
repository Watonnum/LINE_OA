"use client";

import { LiffProvider } from "@/context/LiffContext";

export function Providers({ children }) {
  return <LiffProvider>{children}</LiffProvider>;
}
