"use client";

import { usePageReady } from "@/hooks/use-page-ready";

/**
 * Drop this component into any page's JSX tree.
 * When it mounts, it signals the loading overlay to begin dismissing.
 */
export function PageReadySignal() {
  usePageReady();
  return null;
}
