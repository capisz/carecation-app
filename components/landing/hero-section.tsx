"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useOverlay } from "@/components/overlay/overlay-provider";
import { ShieldCheck, Globe, Wallet, ArrowRight } from "lucide-react";
import { HeroScrollMark } from "./hero-scroll-mark";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const CYCLE_MS = 4500;

// ---- Stripe animation tuning ----
const STRIPE_COUNT = 5;
const STRIPE_OPACITY = 0.095;

// 2-3x faster for more alive feel
const DUR_MIN = 600;
const DUR_MAX = 1200;

// No rest - continuous smooth transitions
const HOLD_MIN = 0;
const HOLD_MAX = 0;

// Starting tones (your current vibe)
const INITIAL_STRIPES_HEX = ["#2b241c", "#3b4031", "#2f2a1f", "#3a3f30", "#2b241c"];

// Palette of possible target tones (keep it close so transitions feel “alive” not chaotic)
const PALETTE_HEX = [
  "#2b241c",
  "#2f2a1f",
  "#3a3f30",
  "#3b4031",
  "#2a231b",
  "#3c4333",
  "#2f291f",
  "#3c4132",
  "#36402f",
  "#404634",
  // slightly lighter olives (helps the fade feel smoother)
  "#4a553f",
  "#45513c",
  "#414b38",
  // Add more subtle warm/cool shifts for variety
  "#352e23", "#3f4535", "#32291d", "#424937", "#2d261c",
  "#4c5841", "#4f5a44", "#38331f", "#444f39", "#2c251a",
  "#485440", "#3d442f", "#31281e", "#47523d", "#3e4934",
];

const SLIDES = [
  {
    detail:
      "Compare accredited providers, pricing ranges, and what’s included—without the sales pressure. Build a plan you can revisit anytime.",
  },
  {
    detail:
      "Organize the essentials: questions to ask, records to gather, and travel considerations—so you can evaluate options with confidence.",
  },
  {
    detail:
      "Shortlist clinics, compare credentials, and keep notes in one place. When you’re ready, turn that research into a carecation plan.",
  },
] as const;

type HSL = { h: number; s: number; l: number };

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

// Smoother than cubic for these slow color drifts
function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function hexToHsl(hex: string): HSL {
  const h = hex.replace("#", "").trim();
  const bigint = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let hh = 0;
  let ss = 0;
  const ll = (max + min) / 2;

  if (d !== 0) {
    ss = d / (1 - Math.abs(2 * ll - 1));
    switch (max) {
      case r:
        hh = ((g - b) / d) % 6;
        break;
      case g:
        hh = (b - r) / d + 2;
        break;
      case b:
        hh = (r - g) / d + 4;
        break;
    }
    hh *= 60;
    if (hh < 0) hh += 360;
  }

  return { h: hh, s: ss * 100, l: ll * 100 };
}

function hslToCss({ h, s, l }: HSL) {
  return `hsl(${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}%)`;
}

function shortestHueDelta(from: number, to: number) {
  let d = ((to - from) % 360 + 360) % 360;
  if (d > 180) d -= 360;
  return d;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpHsl(from: HSL, to: HSL, t: number): HSL {
  const dh = shortestHueDelta(from.h, to.h);
  const h = (from.h + dh * t + 360) % 360;
  return { h, s: lerp(from.s, to.s, t), l: lerp(from.l, to.l, t) };
}

function pickDifferentTarget(cur: HSL, palette: HSL[]) {
  if (palette.length === 0) return cur;
  let next = palette[Math.floor(Math.random() * palette.length)];

  for (let i = 0; i < 15; i++) {
    const dh = Math.abs(shortestHueDelta(cur.h, next.h));
    const ds = Math.abs(cur.s - next.s);
    const dl = Math.abs(cur.l - next.l);
    // Allow more variation for continuous, alive feel
    if (dh + ds + dl > 8 && dh + ds + dl < 180) break;
    next = palette[Math.floor(Math.random() * palette.length)];
  }
  return next;
}

type StripeAnim = {
  from: HSL;
  to: HSL;
  start: number;
  dur: number;
  holdUntil: number;
};

export function HeroSection() {
  const router = useRouter();
  const { runNavOverlay } = useOverlay();
  const reduceMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);
  const slide = useMemo(() => SLIDES[activeIndex], [activeIndex]);

  const stripeElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animRef = useRef<StripeAnim[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (reduceMotion) return;

    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % SLIDES.length);
    }, CYCLE_MS);

    return () => window.clearInterval(id);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;

    const palette = PALETTE_HEX.map(hexToHsl);
    const init = INITIAL_STRIPES_HEX.map(hexToHsl);

    const now = performance.now();

    animRef.current = Array.from({ length: STRIPE_COUNT }, (_, i) => {
      const from = init[i % init.length];
      const to = pickDifferentTarget(from, palette);
      const dur = rand(DUR_MIN, DUR_MAX);
      const start = now - rand(0, dur); // desync stripes
      return { from, to, start, dur, holdUntil: now + rand(HOLD_MIN, HOLD_MAX) };
    });

    const tick = (ts: number) => {
      const els = stripeElsRef.current;

      for (let i = 0; i < STRIPE_COUNT; i++) {
        const el = els[i];
        if (!el) continue;

        const a = animRef.current[i];
        if (!a) continue;

        if (ts < a.holdUntil) {
          el.style.backgroundColor = hslToCss(a.from);
          el.style.opacity = String(STRIPE_OPACITY);
          continue;
        }

        const raw = (ts - a.start) / a.dur;
        const t = clamp(raw, 0, 1);
        const eased = easeInOutSine(t);
        const col = lerpHsl(a.from, a.to, eased);

        el.style.backgroundColor = hslToCss(col);
        el.style.opacity = String(STRIPE_OPACITY);

        if (t >= 1) {
          const nextFrom = a.to;
          const nextTo = pickDifferentTarget(nextFrom, palette);

          animRef.current[i] = {
            from: nextFrom,
            to: nextTo,
            start: ts,
            dur: rand(DUR_MIN, DUR_MAX),
            holdUntil: ts + rand(HOLD_MIN, HOLD_MAX),
          };
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [reduceMotion]);

  const handleCarePlan = () => {
    runNavOverlay("/intake");
    router.push("/intake");
  };

  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-heading">
      <div className="absolute inset-0 bg-secondary/50" />

      {/* Continuously shifting stripes */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 flex">
          {Array.from({ length: STRIPE_COUNT }).map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                stripeElsRef.current[i] = el;
              }}
              className="flex-1"
              style={{
                backgroundColor: INITIAL_STRIPES_HEX[i % INITIAL_STRIPES_HEX.length],
                opacity: STRIPE_OPACITY,
                willChange: "background-color, opacity",
              }}
            />
          ))}
        </div>
      </div>

      <HeroScrollMark src="/brand/heart-plane.webm" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 lg:px-8 lg:py-36">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Accredited providers, transparent information
          </div>

          <h1
            id="hero-heading"
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance leading-tight"
          >
            Thoughtful planning for
            <br />
            <span className="text-primary">healthcare abroad.</span>
          </h1>

          <div className="relative mt-6 max-w-2xl min-h-[84px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={`detail-${activeIndex}`}
                className="absolute inset-0 text-lg text-muted-foreground leading-relaxed text-pretty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
              >
                {slide.detail}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              className="text-base"
              onClick={handleCarePlan}
              onMouseEnter={() => router.prefetch("/intake")}
            >
              Begin your care plan
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>

            <Button size="lg" className="text-base">
              <a href="/results">Browse providers</a>
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Globe className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">3 countries</p>
                <p className="text-xs text-muted-foreground">12+ accredited clinics</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Lower cost options</p>
                <p className="text-xs text-muted-foreground">Compared to US & European prices</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Verified credentials</p>
                <p className="text-xs text-muted-foreground">JCI & international standards</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
