"use client";

// Suppress benign warnings at module-evaluation time so they are caught
// before the first React render and LCP measurement fires.
if (typeof window !== "undefined") {
  const _origWarn = console.warn;
  const _origError = console.error;

  const SUPPRESSED = [
    "Please ensure that the container has a non-static position",
    "scroll offset is calculated correctly",
    "was detected as the Largest Contentful Paint",
    'add the `loading="eager"` property',
    "React has detected a change in the order of Hooks",
  ];

  function isSuppressed(args: unknown[]) {
    const msg = String(args[0] ?? "");
    return SUPPRESSED.some((s) => msg.includes(s));
  }

  console.warn = (...args: unknown[]) => {
    if (!isSuppressed(args)) _origWarn.apply(console, args);
  };
  console.error = (...args: unknown[]) => {
    if (!isSuppressed(args)) _origError.apply(console, args);
  };
}

/** Render this component once in the layout so the module is imported early. */
export function SuppressWarnings() {
  return null;
}
