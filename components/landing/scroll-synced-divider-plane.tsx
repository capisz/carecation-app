"use client";

import { useEffect, useRef, useState } from "react";
import { Plane } from "lucide-react";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** Find the nearest scrollable ancestor (overflow-y auto/scroll). Fallback to window. */
function getScrollParent(el: HTMLElement): Window | HTMLElement {
  let cur: HTMLElement | null = el;
  while (cur && cur !== document.body) {
    const style = window.getComputedStyle(cur);
    const oy = style.overflowY;
    const canScroll =
      (oy === "auto" || oy === "scroll") && cur.scrollHeight > cur.clientHeight + 1;
    if (canScroll) return cur;
    cur = cur.parentElement;
  }
  return window;
}

export function ScrollSyncedDividerPlane({
  startId,
  endId,
}: {
  startId: string;
  endId: string;
}) {
  const planeRef = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  // measurements
  const startYRef = useRef(0);
  const rangeRef = useRef(1);
  const baseXRef = useRef(24);
  const maxXRef = useRef(0);

  // rAF loop
  const rafRef = useRef<number | null>(null);
  const prevScrollRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const plane = planeRef.current;
    if (!plane) return;

    const section = plane.closest("section") as HTMLElement | null;
    if (!section) return;

    const scrollTarget = getScrollParent(section);
    const isWindow = scrollTarget === window;

    const getScrollTop = () =>
      isWindow ? window.scrollY : (scrollTarget as HTMLElement).scrollTop;

    const getContainerTop = () => {
      if (isWindow) return 0;
      return (scrollTarget as HTMLElement).getBoundingClientRect().top;
    };

    const measure = () => {
      const startEl = document.getElementById(startId);
      const endEl = document.getElementById(endId);
      if (!startEl || !endEl) return;

   const scrollTop = getScrollTop();
const containerTop = getContainerTop();

const sy = startEl.getBoundingClientRect().top - containerTop + scrollTop;
const ey = endEl.getBoundingClientRect().top - containerTop + scrollTop;

const containerH = isWindow ? window.innerHeight : (scrollTarget as HTMLElement).clientHeight;

const START_AT = 1; // 1 = bottom edge, 0.85 = a bit inside viewport
startYRef.current = sy - containerH * START_AT;

rangeRef.current = Math.max(ey - sy, 1);


      // keep plane inside gutters
      const cs = window.getComputedStyle(section);
      const padL = parseFloat(cs.paddingLeft || "0") || 0;
      const padR = parseFloat(cs.paddingRight || "0") || 0;
      const gutterL = Math.max(24, padL);
      const gutterR = Math.max(24, padR);

      baseXRef.current = gutterL;

      const sectionW = section.getBoundingClientRect().width || window.innerWidth;
      const planeW = plane.getBoundingClientRect().width || 24;
      maxXRef.current = Math.max(0, sectionW - gutterL - gutterR - planeW);
    };

    // measure after layout settles
    requestAnimationFrame(() => requestAnimationFrame(measure));

    const ro = new ResizeObserver(() => measure());
    ro.observe(section);

    const update = () => {
      const y = getScrollTop();

      // only update when scroll changes (so it "stops" when you stop)
      if (prevScrollRef.current !== y) {
        prevScrollRef.current = y;

        const p = clamp((y - startYRef.current) / rangeRef.current, 0, 1);
        const left = baseXRef.current + p * maxXRef.current;

        plane.style.left = `${left}px`;
        plane.style.opacity = "1";
      }

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);

    // attach scroll listener just to refresh prevScroll quickly + keep things responsive
    const onScroll = () => {
      // no heavy work here; rAF loop reads scrollTop
    };

    const targetEl: any = isWindow ? window : (scrollTarget as HTMLElement);
    targetEl.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      targetEl.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      ro.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [startId, endId, reduceMotion]);

  // NO outline/pill — just the icon
  if (reduceMotion) {
    return (
      <div className="pointer-events-none absolute top-0 left-6 -translate-y-1/2 z-[200]">
        <Plane className="h-6 w-6 text-primary/40" />
      </div>
    );
  }

  return (
    <div
      ref={planeRef}
      className="pointer-events-none absolute top-0 -translate-y-1/2 z-[200]"
      style={{
        left: 24,
        opacity: 1,
        willChange: "left, opacity",
      }}
    >
      <Plane className="h-6 w-6 text-primary drop-shadow-sm" />
    </div>
  );
}
