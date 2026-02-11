"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Timing constants
const FADE_IN_MS = 200;
const FLIGHT_MS = 1200; // Fast ECG flight
const FADE_OUT_MS = 400;

const CURTAIN_IN_MS = 300;
const CURTAIN_OUT_MS = 300;
const PLANE_RISE_MS = 500;

type OverlayVariant = "ecg" | "curtains";

interface TransitionOverlayProps {
  show: boolean;
  variant: OverlayVariant;
  onComplete?: () => void;
}

export function TransitionOverlay({ show, variant, onComplete }: TransitionOverlayProps) {
  const [phase, setPhase] = useState<"hidden" | "visible" | "fading-out">("hidden");
  const pathRef = useRef<SVGPathElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, []);

  useEffect(() => {
    if (!show) {
      setPhase("hidden");
      return;
    }

    setPhase("visible");

    if (variant === "ecg") {
      // ECG sequence: fade in -> plane flight -> fade out
      const flightTimer = setTimeout(() => {
        setPhase("fading-out");
      }, FADE_IN_MS + FLIGHT_MS);

      const completeTimer = setTimeout(() => {
        setPhase("hidden");
        onComplete?.();
      }, FADE_IN_MS + FLIGHT_MS + FADE_OUT_MS);

      return () => {
        clearTimeout(flightTimer);
        clearTimeout(completeTimer);
      };
    } else {
      // Curtains sequence: curtains close -> plane rises -> curtains open -> complete
      const completeTimer = setTimeout(() => {
        setPhase("hidden");
        onComplete?.();
      }, CURTAIN_IN_MS + PLANE_RISE_MS + CURTAIN_OUT_MS);

      return () => clearTimeout(completeTimer);
    }
  }, [show, variant, onComplete]);

  // ECG path coordinates
  const ecgPath = "M 0 50 L 60 50 L 80 50 L 90 20 L 100 80 L 110 50 L 150 50 L 170 50 L 180 25 L 190 75 L 200 50 L 400 50";

  // Plane follows ECG path using getTotalLength/getPointAtLength
  const [planePosition, setPlanePosition] = useState({ x: 0, y: 50, angle: 0 });

  useEffect(() => {
    if (variant !== "ecg" || phase !== "visible" || !pathRef.current || reducedMotion) return;

    const path = pathRef.current;
    const totalLength = path.getTotalLength();
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / FLIGHT_MS, 1);
      const distance = progress * totalLength;

      const point = path.getPointAtLength(distance);
      const nextPoint = path.getPointAtLength(Math.min(distance + 1, totalLength));
      const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);

      setPlanePosition({ x: point.x, y: point.y, angle });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [variant, phase, reducedMotion]);

  if (phase === "hidden") return null;

  return (
    <AnimatePresence mode="wait">
      {phase !== "hidden" && (
        <>
          {variant === "ecg" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === "fading-out" ? 0 : 1 }}
              transition={{
                duration: phase === "fading-out" ? FADE_OUT_MS / 1000 : FADE_IN_MS / 1000,
              }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm"
              role="alert"
              aria-live="assertive"
              aria-label="Loading"
            >
              <div className="flex flex-col items-center gap-8">
                {/* ECG pulse line with plane */}
                <div className="relative w-[400px] h-28">
                  <svg
                    width="400"
                    height="100"
                    viewBox="0 0 400 100"
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Background ECG line */}
                    <path
                      d={ecgPath}
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-primary/20"
                    />
                    {/* Active ECG line (drawn progressively) */}
                    <motion.path
                      ref={pathRef}
                      d={ecgPath}
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="none"
                      className="text-primary"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: reducedMotion ? 1 : 1 }}
                      transition={{
                        duration: reducedMotion ? 0 : FLIGHT_MS / 1000,
                        ease: "linear",
                      }}
                    />
                  </svg>

                  {/* Plane */}
                  {!reducedMotion && (
                    <div
                      className="absolute"
                      style={{
                        left: `${planePosition.x}px`,
                        top: `${planePosition.y}px`,
                        transform: `translate(-50%, -50%) rotate(${planePosition.angle}deg)`,
                      }}
                    >
                      <svg
                        width="40"
                        height="40"
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
                    </div>
                  )}
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-medium text-foreground"
                >
                  Preparing your Carecation…
                </motion.p>
              </div>
            </motion.div>
          )}

          {variant === "curtains" && (
            <div className="fixed inset-0 z-[100] pointer-events-none bg-black/10 backdrop-blur-sm" aria-hidden="true">
              {/* Left curtain */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: phase === "fading-out" ? "-100%" : 0 }}
                transition={{
                  duration: phase === "fading-out" ? CURTAIN_OUT_MS / 1000 : CURTAIN_IN_MS / 1000,
                  ease: "easeInOut",
                }}
                className="absolute left-0 top-0 bottom-0 w-1/2 bg-secondary/80 backdrop-blur-sm border-r"
              />
              {/* Right curtain */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: phase === "fading-out" ? "100%" : 0 }}
                transition={{
                  duration: phase === "fading-out" ? CURTAIN_OUT_MS / 1000 : CURTAIN_IN_MS / 1000,
                  ease: "easeInOut",
                }}
                className="absolute right-0 top-0 bottom-0 w-1/2 bg-secondary/80 backdrop-blur-sm border-l"
              />
              {/* Plane rising upward and exiting top */}
              <motion.div
                initial={{ opacity: 0, y: "60vh" }}
                animate={{
                  opacity: reducedMotion ? [0, 1, 0] : [0, 1, 1, 0],
                  y: reducedMotion ? "60vh" : ["60vh", "0vh", "-60vh"],
                }}
                transition={{
                  duration: reducedMotion ? 0.3 : (CURTAIN_IN_MS + PLANE_RISE_MS + CURTAIN_OUT_MS) / 1000,
                  ease: "easeOut",
                  times: reducedMotion ? undefined : [0, 0.4, 1],
                }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary"
                  style={{ transform: "rotate(-90deg)" }}
                >
                  <path
                    d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z"
                    fill="currentColor"
                  />
                </svg>
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
