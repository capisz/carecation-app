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
const LIGHT_STRIPE_OPACITY = 0.26;
const DARK_STRIPE_OPACITY = 0.37;

// Slow crossfades keep the image changes atmospheric instead of flickery.
const DUR_MIN = 10000;
const DUR_MAX = 15000;

// No rest - continuous smooth transitions
const HOLD_MIN = 0;
const HOLD_MAX = 0;

const DESTINATION_IMAGES = [
  "/destinations/turkey.jpg",
  "/destinations/thailand.jpg",
  "/destinations/mexico.jpg",
  "/destinations/south-korea.jpg",
  "/destinations/spain.jpg",
  "/destinations/japan.jpg",
  "/destinations/vietnam.jpg",
  "/destinations/singapore.jpg",
  "/destinations/netherlands.jpg",
  "/destinations/taiwan.jpg",
  "/destinations/cuba.jpg",
  "/destinations/guatemala.jpg",
  "/destinations/ireland.jpg",
  "/destinations/norway.jpg",
  "/destinations/sweden.jpg",
];

const INITIAL_STRIPE_IMAGES = DESTINATION_IMAGES.slice(0, STRIPE_COUNT);
const INITIAL_TARGET_IMAGES = DESTINATION_IMAGES.slice(STRIPE_COUNT, STRIPE_COUNT * 2);
const STRIPE_POSITIONS = ["42% center", "48% center", "50% center", "54% center", "58% center"];

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

function imageCss(src: string) {
  return `url("${src}")`;
}

function getStripeOpacity() {
  if (typeof document === "undefined") return LIGHT_STRIPE_OPACITY;
  return document.documentElement.classList.contains("dark")
    ? DARK_STRIPE_OPACITY
    : LIGHT_STRIPE_OPACITY;
}

function orderedCandidates(current: string, stripeIndex: number) {
  const currentIndex = Math.max(0, DESTINATION_IMAGES.indexOf(current));
  const start = (currentIndex + stripeIndex + 4) % DESTINATION_IMAGES.length;

  return DESTINATION_IMAGES.map((_, offset) => DESTINATION_IMAGES[(start + offset) % DESTINATION_IMAGES.length]);
}

function usedImagesForNextPick(animations: StripeAnim[], stripeIndex: number) {
  const used = new Set<string>();

  for (let i = 0; i < animations.length; i++) {
    const animation = animations[i];
    if (!animation) continue;

    if (i === stripeIndex) {
      used.add(animation.to);
      continue;
    }

    used.add(animation.from);
    used.add(animation.to);
  }

  return used;
}

function pickUniqueNextImage(current: string, stripeIndex: number, animations: StripeAnim[]) {
  const used = usedImagesForNextPick(animations, stripeIndex);
  const candidates = orderedCandidates(current, stripeIndex);

  return (
    candidates.find((image) => image !== current && !used.has(image)) ??
    candidates.find((image) => image !== current && !animations.some((a, i) => i !== stripeIndex && a.from === image)) ??
    current
  );
}

type StripeAnim = {
  from: string;
  to: string;
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

  const stripeFromElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const stripeToElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animRef = useRef<StripeAnim[]>([]);
  const rafRef = useRef<number>(0);
  const preloadedImagesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    if (reduceMotion) return;

    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % SLIDES.length);
    }, CYCLE_MS);

    return () => window.clearInterval(id);
  }, [reduceMotion]);

  useEffect(() => {
    preloadedImagesRef.current = DESTINATION_IMAGES.map((src) => {
      const image = new window.Image();
      image.src = src;
      return image;
    });
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const now = performance.now();

    animRef.current = Array.from({ length: STRIPE_COUNT }, (_, i) => {
      const from = INITIAL_STRIPE_IMAGES[i % INITIAL_STRIPE_IMAGES.length];
      const to = INITIAL_TARGET_IMAGES[i % INITIAL_TARGET_IMAGES.length];
      const dur = rand(DUR_MIN, DUR_MAX);
      const start = now - rand(0, dur); // desync stripes
      return { from, to, start, dur, holdUntil: now + rand(HOLD_MIN, HOLD_MAX) };
    });

    const tick = (ts: number) => {
      const fromEls = stripeFromElsRef.current;
      const toEls = stripeToElsRef.current;

      for (let i = 0; i < STRIPE_COUNT; i++) {
        const fromEl = fromEls[i];
        const toEl = toEls[i];
        if (!fromEl || !toEl) continue;

        const a = animRef.current[i];
        if (!a) continue;

        const stripeOpacity = getStripeOpacity();

        fromEl.style.backgroundImage = imageCss(a.from);
        toEl.style.backgroundImage = imageCss(a.to);

        if (ts < a.holdUntil) {
          fromEl.style.opacity = String(stripeOpacity);
          toEl.style.opacity = "0";
          continue;
        }

        const raw = (ts - a.start) / a.dur;
        const t = clamp(raw, 0, 1);
        const eased = easeInOutSine(t);

        fromEl.style.opacity = String(stripeOpacity * (1 - eased));
        toEl.style.opacity = String(stripeOpacity * eased);

        if (t >= 1) {
          const nextFrom = a.to;
          const nextTo = pickUniqueNextImage(nextFrom, i, animRef.current);

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
    <section className="relative overflow-hidden" aria-labelledby="hero-heading" style={{ position: 'relative' }}>
      <div className="absolute inset-0 bg-secondary/28" />

      {/* Continuously shifting destination stripes */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 flex">
          {Array.from({ length: STRIPE_COUNT }).map((_, i) => (
            <div
              key={i}
              className="relative flex-1 overflow-hidden border-r border-background/10 last:border-r-0"
            >
              <div
                ref={(el) => {
                  stripeFromElsRef.current[i] = el;
                }}
                className="absolute inset-0 bg-cover"
                style={{
                  backgroundImage: imageCss(INITIAL_STRIPE_IMAGES[i % INITIAL_STRIPE_IMAGES.length]),
                  backgroundPosition: STRIPE_POSITIONS[i % STRIPE_POSITIONS.length],
                  opacity: LIGHT_STRIPE_OPACITY,
                  willChange: "opacity",
                }}
              />
              <div
                ref={(el) => {
                  stripeToElsRef.current[i] = el;
                }}
                className="absolute inset-0 bg-cover"
                style={{
                  backgroundImage: imageCss(INITIAL_TARGET_IMAGES[i % INITIAL_TARGET_IMAGES.length]),
                  backgroundPosition: STRIPE_POSITIONS[i % STRIPE_POSITIONS.length],
                  opacity: 0,
                  willChange: "opacity",
                }}
              />
              <div className="absolute inset-0 bg-secondary/28 dark:bg-background/45" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/28 via-background/10 to-background/22" />
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
          Turn your healthcare
            <br />
            <span className="text-primary"> into adventure abroad.</span>
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
