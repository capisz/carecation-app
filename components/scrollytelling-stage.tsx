"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";

/**
 * Scroll-scrubbed section transitions.
 *
 * ALL sections are rendered in normal document flow — the page scrolls naturally.
 * A sticky overlay layer (pointer-events: none) sits on top and animates
 * curtain panels + upward-flying plane during the transition bands between
 * sections. Everything is derived from scrollYProgress so stopping scroll
 * stops the animation.
 */

interface ScrollytellingStageProps {
  sections: React.ReactNode[];
}

export function ScrollytellingStage({ sections }: ScrollytellingStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const n = sections.length;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "start end"],
  });

  // Each section occupies 1/n of scroll progress.
  // Transition bands sit between sections: last 30% of section i overlapping first 0% of section i+1.
  const sectionSlice = 1 / n;
  const bandRatio = 0.3;

  // Compute band progress: -1 when not in any band, 0-1 when transitioning.
  const bandProgress = useTransform(scrollYProgress, (p) => {
    for (let i = 0; i < n - 1; i++) {
      const bandStart = (i + 1) * sectionSlice - bandRatio * sectionSlice;
      const bandEnd = (i + 1) * sectionSlice + bandRatio * sectionSlice * 0.5;
      if (p >= bandStart && p <= bandEnd) {
        return (p - bandStart) / (bandEnd - bandStart);
      }
    }
    return -1;
  });

  // Curtains: slide in from edges to center at bp=0.5, then slide back out.
  const leftCurtainX = useTransform(bandProgress, (bp) => {
    if (bp < 0) return "-100%";
    if (bp <= 0.5) {
      const t = bp / 0.5;
      return `${-100 + t * 100}%`;
    }
    const t = (bp - 0.5) / 0.5;
    return `${-t * 100}%`;
  });

  const rightCurtainX = useTransform(bandProgress, (bp) => {
    if (bp < 0) return "100%";
    if (bp <= 0.5) {
      const t = bp / 0.5;
      return `${100 - t * 100}%`;
    }
    const t = (bp - 0.5) / 0.5;
    return `${t * 100}%`;
  });

  // Plane: fade in, travel upward, fade out.
  const planeOpacity = useTransform(bandProgress, (bp) => {
    if (bp < 0) return 0;
    if (bp < 0.15) return bp / 0.15;
    if (bp > 0.85) return (1 - bp) / 0.15;
    return 1;
  });

  // Plane Y: starts at +40% of viewport, travels upward to -70% (exits top).
  // Using vh-relative values via percentage of a known range.
  const planeY = useTransform(bandProgress, [0, 0.15, 0.85, 1], [200, 100, -400, -500]);

  // Overall overlay visibility.
  const overlayOpacity = useTransform(bandProgress, (bp) => (bp < 0 ? 0 : 1));

  if (reducedMotion) {
    return (
      <div>
        {sections.map((section, i) => (
          <div key={i}>{section}</div>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative" style={{ position: 'relative' }}>
      {/* Normal document flow: all sections stacked vertically */}
      {sections.map((section, i) => (
        <div key={i}>{section}</div>
      ))}

      {/* Sticky overlay layer: curtains + plane, doesn't block scroll */}
      <div className="sticky bottom-0 h-0 w-full" style={{ zIndex: 50 }}>
        <motion.div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            opacity: overlayOpacity,
            height: "100vh",
          }}
        >
          {/* Subtle backdrop */}
          <div className="absolute inset-0 bg-black/5" />

          {/* Left curtain */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-1/2 bg-secondary/60 backdrop-blur-sm border-r border-border/30"
            style={{ x: leftCurtainX }}
          />
          {/* Right curtain */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-1/2 bg-secondary/60 backdrop-blur-sm border-l border-border/30"
            style={{ x: rightCurtainX }}
          />

          {/* Plane: faces UP, travels vertically upward */}
          <motion.div
            className="absolute left-1/2"
            style={{
              opacity: planeOpacity,
              y: planeY,
              x: "-50%",
              bottom: 0,
              rotate: -90,
            }}
          >
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <path
                d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z"
                fill="currentColor"
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
