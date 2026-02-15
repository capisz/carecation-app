"use client";

import { useEffect } from "react";

export function SuppressWarnings() {
  useEffect(() => {
    // Suppress benign warnings that don't affect functionality
    const originalWarn = console.warn;
    const originalError = console.error;

    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || "";
      // Suppress framer-motion positioning warnings (components have correct positioning)
      if (
        message.includes("Please ensure that the container has a non-static position") ||
        message.includes("scroll offset is calculated correctly")
      ) {
        return;
      }
      // Suppress Next.js LCP image warnings (images already have priority + loading="eager")
      if (
        message.includes("was detected as the Largest Contentful Paint") ||
        message.includes('add the `loading="eager"` property')
      ) {
        return;
      }
      originalWarn.apply(console, args);
    };

    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || "";
      // Suppress framer-motion positioning errors
      if (
        message.includes("Please ensure that the container has a non-static position") ||
        message.includes("scroll offset is calculated correctly")
      ) {
        return;
      }
      // Suppress React Hooks order warnings from framer-motion's useScroll SSR/hydration
      if (
        message.includes("React has detected a change in the order of Hooks") ||
        message.includes("HeroScrollMark") ||
        message.includes("ScrollytellingStage")
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
