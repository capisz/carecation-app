"use client";

import { useEffect } from "react";
import { useLoading } from "@/components/loading-provider";

/**
 * Call this hook at the root of every route page component.
 * It signals the loading overlay that the destination page has mounted,
 * so the overlay can begin its minimum-display countdown and dismiss.
 */
export function usePageReady() {
  const { stopLoading } = useLoading();

  useEffect(() => {
    stopLoading();
  }, [stopLoading]);
}
