"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

const STRIPES = [
  { color: "#A51931", speed: 0.3 },
  { color: "#F4F5F8", speed: 0.5 },
  { color: "#006847", speed: 0.7 },
  { color: "#CE1126", speed: 0.4 },
  { color: "#E30A17", speed: 0.6 },
];

interface FlagParallaxBackgroundProps {
  children: React.ReactNode;
}

export function FlagParallaxBackground({ children }: FlagParallaxBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  /* useScroll against the window, not a container, to avoid the non-static position error */
  const { scrollY } = useScroll();

  /* Fixed number of useTransform calls -- no hooks in loops */
  const y0 = useTransform(scrollY, [0, 500], [0, -100 * STRIPES[0].speed]);
  const y1 = useTransform(scrollY, [0, 500], [0, -100 * STRIPES[1].speed]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100 * STRIPES[2].speed]);
  const y3 = useTransform(scrollY, [0, 500], [0, -100 * STRIPES[3].speed]);
  const y4 = useTransform(scrollY, [0, 500], [0, -100 * STRIPES[4].speed]);
  const stripeY = [y0, y1, y2, y3, y4];

  if (shouldReduceMotion) {
    return (
      <div ref={containerRef} className="relative overflow-hidden">
        <div className="absolute inset-0 flex opacity-[0.08]" aria-hidden="true">
          {STRIPES.map((stripe, i) => (
            <div key={i} className="flex-1" style={{ backgroundColor: stripe.color }} />
          ))}
        </div>
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {STRIPES.map((stripe, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundColor: stripe.color,
              y: stripeY[i],
              left: `${i * 20}%`,
              width: "20%",
            }}
          />
        ))}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
