"use client";

import React, { useEffect, useState } from "react";
import { SmartLink } from "@/components/smart-link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Globe, Wallet, Plane } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/* ── Slide data ── */
const SLIDES = [
  {
    region: "Thailand",
    tagline: "World-class care at a fraction of the cost.",
    detail:
      "Bangkok and Chiang Mai host JCI-accredited hospitals renowned for dental, cardiac, and cosmetic surgery.",
    colors: ["#A51931", "#F4F5F8", "#2D2A4A", "#F4F5F8", "#A51931"],
  },
  {
    region: "Mexico",
    tagline: "Close to home, far ahead in value.",
    detail:
      "Tijuana, Cancun, and Mexico City offer accredited clinics specializing in dental, bariatric, and orthopedic care.",
    colors: ["#006847", "#FFFFFF", "#CE1126", "#FFFFFF", "#006847"],
  },
  {
    region: "Turkey",
    tagline: "Where East meets West in modern medicine.",
    detail:
      "Istanbul leads in hair restoration, ophthalmology, and cosmetic procedures with internationally trained specialists.",
    colors: ["#E30A17", "#FFFFFF", "#E30A17", "#FFFFFF", "#E30A17"],
  },
  {
    region: null, // CTA slide
    tagline: "Ready to start planning?",
    detail:
      "Research accredited providers, compare costs and credentials, and build a carecation plan that fits your needs.",
    colors: null,
  },
] as const;

const SLIDE_COUNT = SLIDES.length;

/** Change these two values to control pacing */
const SLIDE_MS = 5200; // how long each slide stays on screen
const FADE_S = 0.35; // fade duration (seconds)

export function ScrollyHero() {
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;

    let intervalId: number | null = null;

    const start = () => {
      if (intervalId) return;
      intervalId = window.setInterval(() => {
        setActiveIndex((i) => (i + 1) % SLIDE_COUNT);
      }, SLIDE_MS);
    };

    const stop = () => {
      if (!intervalId) return;
      window.clearInterval(intervalId);
      intervalId = null;
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reducedMotion]);

  if (reducedMotion) return <StaticHero />;

  const currentSlide = SLIDES[activeIndex];

  return (
    <section className="relative overflow-hidden min-h-screen" aria-labelledby="hero-heading">
      <div className="absolute inset-0 bg-secondary/50" />

      {/* Background stripes (fade between slides) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${activeIndex}`}
          className="absolute inset-0 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_S }}
        >
          {currentSlide.colors
            ? currentSlide.colors.map((color, i) => (
                <div
                  key={`${activeIndex}-${i}`}
                  className="flex-1"
                  style={{ backgroundColor: color, opacity: 0.08 }}
                />
              ))
            : Array.from({ length: 5 }).map((_, i) => (
                <div key={`cta-${i}`} className="flex-1 bg-primary" style={{ opacity: 0.04 }} />
              ))}
        </motion.div>
      </AnimatePresence>

      {/* Floating plane decoration (CSS float; no JS timing needed) */}
      <div className="absolute top-12 right-16 opacity-10 text-primary animate-[floaty_3s_ease-in-out_infinite]">
        <Plane className="h-8 w-8" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 py-24 lg:px-8 lg:py-36">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${activeIndex}`}
            className="max-w-3xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: FADE_S }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              {currentSlide.region ? `Explore ${currentSlide.region}` : "Accredited providers, transparent information"}
            </div>

            {/* Heading */}
            <h1
              id="hero-heading"
              className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance leading-tight"
            >
              {currentSlide.region ? (
                <>
                  {currentSlide.tagline.split(",")[0]}
                  {currentSlide.tagline.includes(",") && (
                    <>
                      ,<br />
                      <span className="text-primary">
                        {currentSlide.tagline.split(",").slice(1).join(",")}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <>
                  {currentSlide.tagline}
                  <br />
                  <span className="text-primary">No commitment required.</span>
                </>
              )}
            </h1>

            {/* Description */}
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl text-pretty">
              {currentSlide.detail}
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="text-base">
                <SmartLink href="/intake">
                  Begin your care plan
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </SmartLink>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base bg-transparent">
                <SmartLink href="/results">Browse providers</SmartLink>
              </Button>
            </div>

            {/* Stats row */}
            <div className="mt-12 flex flex-wrap gap-8">
              <StatItem
                icon={<Globe className="h-5 w-5 text-primary" aria-hidden="true" />}
                title="3 countries"
                subtitle="12+ accredited clinics"
              />
              <StatItem
                icon={<Wallet className="h-5 w-5 text-primary" aria-hidden="true" />}
                title="Lower cost options"
                subtitle="Compared to US & European prices"
              />
              <StatItem
                icon={<ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />}
                title="Verified credentials"
                subtitle="JCI & international standards"
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div
          className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2"
          role="tablist"
          aria-label="Hero slides"
        >
          {SLIDES.map((slide, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={slide.region ?? "Get started"}
              onClick={() => setActiveIndex(i)}
              className={`w-2 rounded-full transition-all duration-300 ${
                i === activeIndex ? "bg-primary h-4" : "bg-muted-foreground/30 h-2"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Local keyframes for plane float */}
      <style jsx>{`
        @keyframes floaty {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
    </section>
  );
}

function StatItem({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

/** Static hero fallback for reduced motion */
function StaticHero() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-heading">
      <div className="absolute inset-0 bg-secondary/50" />
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
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl text-pretty">
            Research accredited providers across Thailand, Mexico, and Turkey.
            Understand your options, compare costs and credentials, and build a carecation plan that fits your needs.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg" className="text-base">
              <SmartLink href="/intake">
                Begin your care plan
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </SmartLink>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base bg-transparent">
              <SmartLink href="/results">Browse providers</SmartLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
