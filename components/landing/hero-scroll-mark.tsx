"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export function HeroScrollMark({
  lightSrc = "/brand/carecation-heart-light.png",
  darkSrc = "/brand/carecation-heart-dark.png",
}: {
  lightSrc?: string;
  darkSrc?: string;
}) {
  const reduce = useReducedMotion();

  // Use window-level scrollY to avoid the "non-static container" warning
  // that occurs when useScroll({ target }) is used with an absolutely
  // positioned element. We map the first 500px of scroll to 0-1 progress.
  const { scrollY } = useScroll();

  // motion while scrolling out
  const x = useTransform(scrollY, [0, 500], [0, -140]); // drift LEFT
  const y = useTransform(scrollY, [0, 500], [0, -160]); // drift UP
  const opacity = useTransform(scrollY, [0, 400, 500], [1, 0.55, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 0.92]);
  const rotate = useTransform(scrollY, [0, 500], [0, 6]);

  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block">
      <motion.div
        className="absolute top-1/4 right-64 -translate-y-1/2"
        style={
          reduce
            ? undefined
            : {
                x,
                y,
                opacity,
                scale,
                rotate,
                willChange: "transform, opacity",
              }
        }
      >
        {/* Light mode */}
        <Image
          src={lightSrc}
          alt=""
          aria-hidden="true"
          width={1000}
          height={1000}
          priority
          loading="eager"
          className="block dark:hidden w-[320px] max-w-[34vw] h-auto select-none"
        />

        {/* Dark mode */}
        <Image
          src={darkSrc}
          alt=""
          aria-hidden="true"
          width={1000}
          height={1000}
          priority
          loading="eager"
          className="hidden dark:block w-[320px] max-w-[34vw] h-auto select-none"
        />
      </motion.div>
    </div>
  );
}
