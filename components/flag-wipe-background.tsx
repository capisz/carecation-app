"use client";

import React from "react"

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

type RegionPalette = {
  name: string;
  colors: string[];
};

const regionPalettes: RegionPalette[] = [
  {
    name: "spain",
    colors: ["#C60B1E", "#FFC400", "#C60B1E", "#FFC400", "#C60B1E"],
  },
  {
    name: "thailand",
    colors: ["#A51931", "#F4F5F8", "#2D2A4A", "#F4F5F8", "#A51931"],
  },
  {
    name: "mexico",
    colors: ["#006847", "#FFFFFF", "#CE1126", "#FFFFFF", "#006847"],
  },
];

interface FlagWipeBackgroundProps {
  children: React.ReactNode;
  activeRegion?: number;
}

export function FlagWipeBackground({ children, activeRegion = 0 }: FlagWipeBackgroundProps) {
  const shouldReduceMotion = useReducedMotion();
  const [currentPalette] = useState(regionPalettes[activeRegion % regionPalettes.length]);

  if (shouldReduceMotion) {
    return <div className="relative">{children}</div>;
  }

  return (
    <div className="relative overflow-hidden">
      {/* Animated flag stripes background */}
      <motion.div
        className="absolute inset-0 flex"
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        {currentPalette.colors.map((color, i) => (
          <motion.div
            key={i}
            className="flex-1 opacity-[0.08]"
            style={{ backgroundColor: color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.08 }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
          />
        ))}
      </motion.div>

      {/* Floating plane decoration */}
      <motion.div
        className="absolute top-8 right-12 opacity-20"
        animate={{
          y: [0, -10, 0],
          x: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          className="text-primary"
        >
          <path
            d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z"
            fill="currentColor"
          />
        </svg>
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
