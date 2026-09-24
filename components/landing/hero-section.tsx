"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useOverlay } from "@/components/overlay/overlay-provider";
import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";

// ---- Stripe animation tuning ----
const STRIPE_COUNT = 5;
const LIGHT_STRIPE_OPACITY = 0.62;
const DARK_STRIPE_OPACITY = 0.62;

// Slow crossfades keep the image changes atmospheric instead of flickery.
const CROSSFADE_MS = 3200;
const STRIPE_INTERVAL_MS = 1500;

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
const STRIPE_POSITIONS = ["42% center", "48% center", "50% center", "54% center", "58% center"];

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
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

  const stripeFromElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const stripeToElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animRef = useRef<StripeAnim[]>([]);
  const rafRef = useRef<number>(0);
  const preloadedImagesRef = useRef<HTMLImageElement[]>([]);

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
      return { from, to: from, start: now, dur: CROSSFADE_MS, holdUntil: Number.POSITIVE_INFINITY };
    });

    let nextStripe = 0;
    const stripeTimer = window.setInterval(() => {
      const stripeIndex = nextStripe++ % STRIPE_COUNT;
      const current = animRef.current[stripeIndex];
      if (!current) return;
      const from = current.to;
      const to = pickUniqueNextImage(from, stripeIndex, animRef.current);
      animRef.current[stripeIndex] = { from, to, start: performance.now(), dur: CROSSFADE_MS, holdUntil: 0 };
    }, STRIPE_INTERVAL_MS);

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
          animRef.current[i] = { from: a.to, to: a.to, start: ts, dur: CROSSFADE_MS, holdUntil: Number.POSITIVE_INFINITY };
          fromEl.style.backgroundImage = imageCss(a.to);
          toEl.style.backgroundImage = imageCss(a.to);
          fromEl.style.opacity = String(stripeOpacity);
          toEl.style.opacity = "0";
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.clearInterval(stripeTimer);
      rafRef.current = 0;
    };
  }, [reduceMotion]);

  const handleCarePlan = () => {
    runNavOverlay("/intake");
    router.push("/intake");
  };

  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-heading" style={{ position: 'relative' }}>
      <div className="absolute inset-0 bg-secondary/10" />

      {/* Continuously shifting destination stripes */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 flex">
          {Array.from({ length: STRIPE_COUNT }).map((_, i) => (
            <div
              key={i}
              className="relative flex-1 overflow-hidden last:border-r-0"
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
                  backgroundImage: imageCss(INITIAL_STRIPE_IMAGES[i % INITIAL_STRIPE_IMAGES.length]),
                  backgroundPosition: STRIPE_POSITIONS[i % STRIPE_POSITIONS.length],
                  opacity: 0,
                  willChange: "opacity",
                }}
              />
              <div className="absolute inset-0 bg-secondary/5 dark:bg-background/15" />
            </div>
          ))}
        </div>
        <div className="hero-image-fade absolute inset-0" />
      </div>

      <div className="relative mx-auto flex min-h-[820px] max-w-7xl items-end px-6 pb-16 pt-36 lg:px-8 lg:pb-20">
        <div className="max-w-5xl">

          <h1
            id="hero-heading"
            className="care-h1 hero-reveal-1 text-5xl leading-[1.02] sm:text-6xl lg:text-[84px]"
          >
          Turn your healthcare
            <br />
            <span className="text-primary"> into adventure abroad.</span>
          </h1>

          <div className="hero-reveal-2 mt-8 flex flex-wrap items-center gap-5">
            <Button
              size="lg"
              className="care-pill text-base"
              onClick={handleCarePlan}
              onMouseEnter={() => router.prefetch("/intake")}
            >
              Start your plan
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>

            <a href="/clinics" className="font-bold text-foreground underline decoration-primary underline-offset-8">Browse providers</a>
          </div>

          <p className="hero-reveal-3 mt-8 text-sm font-bold text-foreground/80">12+ accredited clinics <span className="mx-2 text-primary">·</span> Lower cost than US &amp; EU <span className="mx-2 text-primary">·</span> JCI-verified</p>
        </div>
      </div>
    </section>
  );
}
