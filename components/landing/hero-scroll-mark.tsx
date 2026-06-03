"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

export function HeroScrollMark({
  src,
  lightSrc = "/brand/carecation-heart-light.png",
  darkSrc = "/brand/carecation-heart-dark.png",
}: {
  src?: string;
  lightSrc?: string;
  darkSrc?: string;
}) {
  const targetRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Only initialize scroll after mount to avoid SSR/hydration hook order issues
  const { scrollYProgress } = useScroll({
    target: isMounted ? targetRef : undefined,
    offset: ["start start", "end start"],
  });

  // motion while scrolling out
  const x = useTransform(scrollYProgress, [0, 1], [0, -140]); // drift LEFT
  const y = useTransform(scrollYProgress, [0, 1], [0, -160]); // drift UP
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.55, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 6]);
  const lightMediaSrc = src ?? lightSrc;
  const darkMediaSrc = src ?? darkSrc;
  const isVideoMedia = (value: string) => /\.(mp4|webm|ogg)$/i.test(value);
  const mediaClassName = "w-[320px] max-w-[34vw] h-auto select-none";

  const renderMedia = (value: string, className: string) =>
    isVideoMedia(value) ? (
      <video
        src={value}
        aria-hidden="true"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={`${className} ${mediaClassName}`}
      />
    ) : (
      <Image
        src={value}
        alt=""
        aria-hidden="true"
        width={1000}
        height={1000}
        priority
        loading="eager"
        className={`${className} ${mediaClassName}`}
      />
    );

  return (
    <div
      ref={targetRef}
      className="pointer-events-none absolute inset-0 hidden lg:block"
      style={{ position: 'absolute' }}
    >
      <motion.div
        className="absolute top-1/4 right-64 -translate-y-1/2"
        style={
          prefersReducedMotion
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
        {renderMedia(lightMediaSrc, "block dark:hidden")}
        {renderMedia(darkMediaSrc, "hidden dark:block")}
      </motion.div>
    </div>
  );
}
