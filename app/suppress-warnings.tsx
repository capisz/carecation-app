"use client";

import { useEffect } from "react";

export function SuppressWarnings() {
  useEffect(() => {
    // Suppress framer-motion positioning warnings
    // These are benign warnings from useScroll's internal checks
    // The components already have proper positioning
    const originalWarn = console.warn;
    const originalError = console.error;

    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || "";
      if (
        message.includes("Please ensure that the container has a non-static position") ||
        message.includes("scroll offset is calculated correctly")
      ) {
        return;
      }
      originalWarn.apply(console, args);
    };

    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || "";
      if (
        message.includes("Please ensure that the container has a non-static position") ||
        message.includes("scroll offset is calculated correctly")
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return null;
}
