"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOverlay } from "./overlay-provider";

/**
 * ECG path spanning ~70% of the SVG width (0..450).
 * Three distinct QRS spikes for visual punch.
 */
const ECG_PATH =
  "M 0,50 L 60,50 L 80,50 L 95,15 L 105,85 L 115,50 L 180,50 L 200,50 L 215,20 L 225,80 L 235,50 L 310,50 L 330,50 L 345,10 L 355,90 L 365,50 L 450,50";

const CYCLE_MS = 2500;

function smoothstep01(t: number) {
  // Smoothstep: t*t*(3-2*t)
  return t * t * (3 - 2 * t);
}

export function NavOverlay() {
  const { visible, runId } = useOverlay();
  const pathRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  useEffect(() => {
    if (!visible || reducedMotion) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    // Wait one frame for SVG to mount
    const init = requestAnimationFrame(() => {
      const path = pathRef.current;
      const trail = trailRef.current;
      const glow = glowRef.current;
      const plane = planeRef.current;
      if (!path || !trail || !glow || !plane) return;

      const len = path.getTotalLength();
      trail.style.strokeDasharray = `${len}`;
      trail.style.strokeDashoffset = `${len}`;
      glow.style.strokeDasharray = `${len}`;
      glow.style.strokeDashoffset = `${len}`;

      startRef.current = performance.now();

      const tick = (ts: number) => {
        const elapsed = ts - startRef.current;

        // 0..1 cycle progress
        const raw = (elapsed % CYCLE_MS) / CYCLE_MS;
        // smoother motion
        const t = smoothstep01(raw);

        const dist = t * len;

        // Trail (glow + main) stay in sync
        const dash = `${len * (1 - t)}`;
        trail.style.strokeDashoffset = dash;
        glow.style.strokeDashoffset = dash;

        // Plane position (fixed orientation)
        const pt = path.getPointAtLength(dist);
        plane.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(init);
      cancelAnimationFrame(rafRef.current);
    };
  }, [visible, reducedMotion, runId]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={`nav-overlay-${runId}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm"
          role="alert"
          aria-live="assertive"
          aria-label="Navigating to your care plan"
        >
          {reducedMotion ? (
            <p className="text-sm font-medium text-foreground">
              Preparing your Carecation...
            </p>
          ) : (
            <div className="w-full max-w-lg px-8">
              <svg
                viewBox="0 0 450 100"
                className="w-full h-auto"
                preserveAspectRatio="xMidYMid meet"
                shapeRendering="geometricPrecision"
                aria-hidden="true"
              >
                <defs>
                  {/* subtle glow for the animated trail */}
                  <filter
                    id="ecgGlow"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                    colorInterpolationFilters="sRGB"
                  >
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Faint background ECG */}
                <path
                  d={ECG_PATH}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  className="text-primary/15"
                />

                {/* Glow trail (animated) */}
                <path
                  ref={glowRef}
                  d={ECG_PATH}
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  className="text-primary/25"
                  filter="url(#ecgGlow)"
                />

                {/* Main animated trail */}
                <path
                  ref={trailRef}
                  d={ECG_PATH}
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  className="text-primary"
                />

                {/* Hidden measurement path */}
                <path ref={pathRef} d={ECG_PATH} fill="none" stroke="none" />

                {/* Plane (fixed facing RIGHT) */}
                <g ref={planeRef}>
                  {/* Center 24x24 icon at motion point, rotate artwork to face right */}
                  <g transform="translate(-12, -12) rotate(90 12 12) scale(1.05)">
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
                Preparing your Carecation...
              </motion.p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
