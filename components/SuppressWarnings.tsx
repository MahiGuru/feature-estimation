"use client";

import { useEffect } from "react";

export default function SuppressWarnings() {
  useEffect(() => {
    // Suppress hydration warnings caused by browser extensions
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      // Convert args to string for checking
      const errorString = args.join(" ");

      // Filter out hydration warnings caused by browser extensions
      if (
        errorString.includes("Extra attributes from the server") ||
        errorString.includes("data-lastpass") ||
        errorString.includes("data-1password") ||
        errorString.includes("data-dashlane") ||
        errorString.includes("data-bitwarden") ||
        errorString.includes("data-lpignore") ||
        errorString.includes("data-sharkid") ||
        errorString.includes("data-ad-block") ||
        errorString.includes("data-extension") ||
        errorString.includes("at select") ||
        errorString.includes("Warning: Prop") ||
        errorString.includes("did not match")
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const warnString = args.join(" ");

      if (
        warnString.includes("Extra attributes from the server") ||
        warnString.includes("data-sharkid") ||
        warnString.includes("data-ad-block") ||
        warnString.includes("data-extension") ||
        warnString.includes("at select")
      ) {
        return;
      }
      originalWarn.apply(console, args);
    };

    // Cleanup
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return null;
}
