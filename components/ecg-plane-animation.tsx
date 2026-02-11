"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLoading, LOADER_CYCLE_MS } from "./loading-provider";

/**
 * ECG path with visible zig-zag spikes.
 */
const ECG_PATH =
  "M 0,50 L 60,50 L 80,50 L 95,15 L 105,85 L 115,50 L 180,50 L 200,50 L 215,20 L 225,80 L 235,50 L 310,50 L 330,50 L 345,10 L 355,90 L 365,50 L 450,50";

const FADE_DURATION = 0.2;

export function LoadingOverlay() {
  const { isLoading } = useLoading();
  const reducedMotion = useReducedMotion();

  const pathRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const [planePos, setPlanePos] = useState({ x: 0, y: 50 });

  useEffect(() => {
    if (!isLoading) {
      cancelAnimationFrame(rafRef.current);
      setPlanePos({ x: 0, y: 50 });
      startTimeRef.current = 0;

      // optional: reset trail visually
      const trail = trailRef.current;
      const path = pathRef.current;
      if (trail && path) {
        const totalLength = path.getTotalLength();
        trail.style.strokeDasharray = `${totalLength}`;
        trail.style.strokeDashoffset = `${totalLength}`;
      }
      return;
    }

    if (reducedMotion) return;

    const path = pathRef.current;
    const trail = trailRef.current;
    if (!path || !trail) return;

    const totalLength = path.getTotalLength();
    trail.style.strokeDasharray = `${totalLength}`;

    startTimeRef.current = performance.now();

    const tick = (timestamp: number) => {
      if (!startTimeRef.current) return;

      const elapsed = timestamp - startTimeRef.current;
      const p = (elapsed % LOADER_CYCLE_MS) / LOADER_CYCLE_MS;
      const dist = p * totalLength;

      const pt = path.getPointAtLength(dist);
      setPlanePos({ x: pt.x, y: pt.y });

      trail.style.strokeDashoffset = `${totalLength * (1 - p)}`;

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [isLoading, reducedMotion]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_DURATION }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm"
          role="alert"
          aria-live="assertive"
          aria-label="Loading"
        >
          {reducedMotion ? (
            <p className="text-sm font-medium text-foreground">Loading…</p>
          ) : (
            <div className="w-full max-w-lg px-8">
              <svg
                width="450"
                height="100"
                viewBox="0 0 450 100"
                className="w-full h-auto"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Background ECG line */}
                <path
                  d={ECG_PATH}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  className="text-primary/15"
                />

                {/* Active trail drawn behind the plane */}
                <path
                  ref={trailRef}
                  d={ECG_PATH}
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="none"
                  className="text-primary"
                  strokeLinecap="round"
                />

                {/* Hidden path for getPointAtLength measurement */}
                <path ref={pathRef} d={ECG_PATH} fill="none" stroke="none" />

                {/* Plane icon - fixed facing RIGHT */}
                <g transform={`translate(${planePos.x}, ${planePos.y})`}>
                  <g transform="translate(-12, -12) rotate(90 12 12)">
                    <path
                      d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z"
                      fill="currentColor"
                      className="text-primary"
                    />
                  </g>
                </g>
              </svg>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-4 text-center text-sm font-medium text-foreground"
              >
                Preparing your Carecation…
              </motion.p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
