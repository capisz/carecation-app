"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type RunOptions = {
  minMs?: number;
  maxMs?: number;
};

interface OverlayContextValue {
  /** Whether the overlay is currently shown */
  visible: boolean;
  /** Bumps every time the overlay is triggered (lets animations remount/restart) */
  runId: number;
  /** Trigger the navigation overlay (does NOT push a route by itself). */
  runNavOverlay: (href: string, opts?: RunOptions) => void;
  /** Force-hide (failsafe / manual dismiss) */
  dismiss: () => void;
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

export function useOverlay() {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error("useOverlay must be used inside OverlayProvider");
  return ctx;
}

const DEFAULT_MIN_MS = 2500;
const DEFAULT_MAX_MS = 8000;

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);
  const [runId, setRunId] = useState(0);

  const targetRef = useRef<string | null>(null);
  const minDoneRef = useRef(false);
  const routeDoneRef = useRef(false);
  const minTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (minTimerRef.current) clearTimeout(minTimerRef.current);
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    minTimerRef.current = null;
    maxTimerRef.current = null;
  };

  const dismiss = useCallback(() => {
    clearTimers();
    targetRef.current = null;
    minDoneRef.current = false;
    routeDoneRef.current = false;
    setVisible(false);
  }, []);

  const tryDismiss = useCallback(() => {
    if (minDoneRef.current && routeDoneRef.current) {
      dismiss();
    }
  }, [dismiss]);

  const runNavOverlay = useCallback(
    (href: string, opts?: RunOptions) => {
      const minMs = opts?.minMs ?? DEFAULT_MIN_MS;
      const maxMs = opts?.maxMs ?? DEFAULT_MAX_MS;

      // Restart cleanly every time (even if it's already visible)
      clearTimers();

      targetRef.current = href;
      minDoneRef.current = false;
      routeDoneRef.current = pathname === href; // if already on target route

      setVisible(true);
      setRunId((r) => r + 1);

      minTimerRef.current = setTimeout(() => {
        minDoneRef.current = true;
        tryDismiss();
      }, minMs);

      maxTimerRef.current = setTimeout(() => {
        // failsafe
        dismiss();
      }, maxMs);
    },
    [pathname, tryDismiss, dismiss]
  );

  // Route completion: if pathname matches target, allow dismissal once min timer is done
  useEffect(() => {
    if (!visible) return;
    const target = targetRef.current;
    if (!target) return;
    if (pathname === target) {
      routeDoneRef.current = true;
      tryDismiss();
    }
  }, [pathname, visible, tryDismiss]);

  // Cleanup
  useEffect(() => {
    return () => clearTimers();
  }, []);

  const value = useMemo(
    () => ({ visible, runId, runNavOverlay, dismiss }),
    [visible, runId, runNavOverlay, dismiss]
  );

  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
}
