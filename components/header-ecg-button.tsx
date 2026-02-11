"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const MIN_DURATION_MS = 2500;

const ECG_PATH =
  "M 0,20 L 20,20 L 30,20 L 38,5 L 44,35 L 50,20 L 65,20 L 75,20 L 83,8 L 89,32 L 95,20 L 115,20 L 125,20 L 133,3 L 139,37 L 145,20 L 170,20";

// ✅ Force plane to face RIGHT no matter what
const PLANE_ROT_DEG = -90; // if it ever ends up facing LEFT, change to -90

export function HeaderEcgButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  // JS path sampling (no SMIL rotate behavior)
  const pathRef = useRef<SVGPathElement | null>(null);
  const planeGRef = useRef<SVGGElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTsRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ✅ Move plane along path with JS; plane orientation is fixed via a constant rotate
  useEffect(() => {
    if (!loading || reduceMotion) return;

    const pathEl = pathRef.current;
    const planeG = planeGRef.current;
    if (!pathEl || !planeG) return;

    const total = pathEl.getTotalLength();
    startTsRef.current = null;

    const step = (ts: number) => {
      if (startTsRef.current == null) startTsRef.current = ts;
      const elapsed = ts - startTsRef.current;

      const t = Math.min(elapsed / MIN_DURATION_MS, 1);
      const pt = pathEl.getPointAtLength(t * total);

      // translate only (no rotation applied here)
      planeG.setAttribute("transform", `translate(${pt.x} ${pt.y})`);

      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [loading, reduceMotion]);

  const handleClick = useCallback(() => {
    if (loading) return;

    if (reduceMotion) {
      router.push("/intake");
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(() => {
      setLoading(false);
      router.push("/intake");
    }, MIN_DURATION_MS);
  }, [loading, reduceMotion, router]);

  return (
    <div className={className}>
      <Button
        onClick={handleClick}
        disabled={loading}
        aria-busy={loading}
        className="relative overflow-hidden min-w-[200px]"
      >
        <span className="transition-opacity duration-150" style={{ opacity: loading ? 0 : 1 }}>
          Begin your care plan
        </span>

        {loading && (
          <span className="absolute inset-0 flex items-center justify-center px-3">
            <svg
              viewBox="0 0 170 40"
              className="w-full h-6"
              preserveAspectRatio="xMidYMid meet"
              role="presentation"
              aria-hidden="true"
            >
              {/* Hidden path for JS sampling */}
              <path
                ref={pathRef}
                d={ECG_PATH}
                fill="none"
                stroke="transparent"
                strokeWidth="1"
                opacity="0"
              />

              {/* Background ECG */}
              <path
                d={ECG_PATH}
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                className="text-primary-foreground/20"
              />

              {/* Trail drawing */}
              <path
                d={ECG_PATH}
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-primary-foreground"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 400,
                  strokeDashoffset: 400,
                  animation: `ecg-draw ${MIN_DURATION_MS}ms ease-in-out forwards`,
                }}
              />

              {/* Plane moved by JS. Orientation forced here. */}
              <g ref={planeGRef} className="text-primary-foreground">
                <g transform={`rotate(${PLANE_ROT_DEG})`}>
                  {/* Right-facing "paper plane" shape, centered on motion point */}
                  <g transform="translate(-10, -6)">
                    <path d="M0 6h10l6-4-2 4 2 4-6-4H0Z" fill="currentColor" />
                  </g>
                </g>
              </g>
            </svg>
          </span>
        )}
      </Button>

      {loading && (
        <style jsx>{`
          @keyframes ecg-draw {
            0% {
              stroke-dashoffset: 400;
            }
            100% {
              stroke-dashoffset: 0;
            }
          }
        `}</style>
      )}
    </div>
  );
}
