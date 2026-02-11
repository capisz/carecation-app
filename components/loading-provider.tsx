"use client";

import React, { createContext, useCallback, useContext, useRef, useState } from "react";

/**
 * ECG+plane animation loop duration.
 * The overlay runs one full ECG trace in this time.
 */
export const LOADER_CYCLE_MS = 4500;

/** Small anti-flicker floor */
const ANTI_FLICKER_MS = 300;

/** Safety timeout: auto-dismiss if something goes wrong */
const SAFETY_TIMEOUT_MS = 15_000;

interface LoadingContextValue {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextValue>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
  withLoading: async (fn) => fn(),
});

export function useLoading() {
  return useContext(LoadingContext);
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counterRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    dismissTimerRef.current = null;
    safetyTimerRef.current = null;
  }, []);

  const hide = useCallback(() => {
    clearTimers();
    setIsLoading(false);
    startTimeRef.current = null;
    counterRef.current = 0;
  }, [clearTimers]);

  const startLoading = useCallback(() => {
    clearTimers();
    counterRef.current += 1;
    startTimeRef.current = Date.now();
    setIsLoading(true);

    // Safety: auto-dismiss after 15s
    safetyTimerRef.current = setTimeout(hide, SAFETY_TIMEOUT_MS);
  }, [clearTimers, hide]);

  const stopLoading = useCallback(() => {
    if (!startTimeRef.current) return;

    counterRef.current = Math.max(0, counterRef.current - 1);

    // If multiple overlapping loads, don't stop yet
    if (counterRef.current > 0) return;

    const elapsed = Date.now() - startTimeRef.current;
    const minDisplay = Math.max(LOADER_CYCLE_MS, ANTI_FLICKER_MS);
    const remaining = Math.max(0, minDisplay - elapsed);

    if (remaining > 0) {
      dismissTimerRef.current = setTimeout(hide, remaining);
    } else {
      hide();
    }
  }, [hide]);

  const withLoading = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      startLoading();
      try {
        return await fn();
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading],
  );

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading, withLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}
