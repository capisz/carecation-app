"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * Thin wrapper around Next.js Link.
 * Previously wired to the loading overlay; now a plain pass-through
 * kept for API compatibility across the codebase.
 */
export function SmartLink(props: ComponentProps<typeof Link>) {
  return <Link {...props} />;
}
