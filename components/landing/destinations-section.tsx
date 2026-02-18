"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Destination = {
  country: string;
  image: string;
  cities: string[];
  specialties: string[];
  note: string;
  description: string;
};

const BASE_SPEED_PX_PER_SEC = 28;

const destinations: Destination[] = [
  {
    country: "Thailand",
    image: "/destinations/thailand.jpg",
    cities: ["Bangkok", "Phuket"],
    specialties: ["Dental", "Cosmetic Surgery"],
    note: "Often significantly lower cost",
    description:
      "Well-established medical tourism infrastructure with accredited hospitals and recovery-friendly accommodations. Many clinics support international patients with clear scheduling, transparent pricing, and aftercare guidance—useful when you want a plan you can keep organized end-to-end.",
  },
  {
    country: "Mexico",
    image: "/destinations/mexico.jpg",
    cities: ["Cancun", "Tijuana", "Monterrey", "Guadalajara"],
    specialties: ["Dental", "Bariatric", "Orthopedic"],
    note: "Proximity to the US",
    description:
      "Convenient travel from the United States with bilingual teams and growing international accreditation standards. Many providers are used to shorter trips, offering clear pre-visit instructions, defined care plans, and coordination for follow-ups—helpful if you're comparing options quickly and carefully.",
  },
  {
    country: "Turkey",
    image: "/destinations/turkey.jpg",
    cities: ["Istanbul", "Antalya", "Ankara"],
    specialties: ["Hair Transplant", "Cosmetic", "Dental"],
    note: "Packages often available",
    description:
      "A major hub known for comprehensive packages and experienced specialists. Famous for its cosmetic procedures and hair transplants. Clinics often bundle logistics and provide clear post-procedure instructions, which helps when you want planning to stay simple and organized before you travel.",
  },
  {
    country: "Spain",
    image: "/destinations/spain.jpg",
    cities: ["Barcelona", "Madrid"],
    specialties: ["Orthopedic", "Dental"],
    note: "EU standards",
    description:
      "Modern private hospitals and specialist clinics operate under strong EU safety and quality standards. Many centers support international patients with clear coordination, transparent care plans, and practical recovery guidance—making it easier to plan treatment alongside comfortable travel.",
  },
  {
    country: "Guatemala",
    image: "/destinations/guatemala.jpg",
    cities: ["Guatemala City", "Antigua"],
    specialties: ["Dental"],
    note: "Value-focused",
    description:
      "A popular choice for value-focused dental care, with many clinics accustomed to international visitors. Expect straightforward scheduling, clear pricing for common procedures, and practical logistics for shorter stays—especially when you want a simpler plan with minimal recovery overhead.",
  },
  {
    country: "South Korea",
    image: "/destinations/south-korea.jpg",
    cities: ["Seoul", "Busan"],
    specialties: ["Cosmetic", "Dermatology"],
    note: "Specialist expertise",
    description:
      "Known for highly specialized cosmetic and dermatology clinics with advanced technology and meticulous process. Many practices offer structured consultations, detailed aftercare instructions, and dedicated coordinators—helpful if you want an organized experience with clear steps and expectations.",
  },
  {
    country: "Vietnam",
    image: "/destinations/vietnam.jpg",
    cities: ["Ho Chi Minh City", "Hanoi"],
    specialties: ["Dental", "Cosmetic"],
    note: "Affordable care",
    description:
      "An expanding medical tourism ecosystem in major cities, offering strong value for dental and cosmetic procedures. Many clinics provide clear pre-visit guidance, packaged coordination support, and practical recovery planning—useful if you want dependable logistics at a lower cost.",
  },
  {
    country: "Cuba",
    image: "/destinations/cuba.jpg",
    cities: ["Havana"],
    specialties: ["General Care"],
    note: "Public system",
    description:
      "Historically recognized for medical training and a large public healthcare system, with some services accessed through structured programs. Travel logistics can be more specific than other destinations, so planning often benefits from clear documentation, expectations, and step-by-step coordination.",
  },
  {
    country: "Taiwan",
    image: "/destinations/taiwan.jpg",
    cities: ["Taipei", "Taichung"],
    specialties: ["Dental", "Diagnostics"],
    note: "High quality",
    description:
      "Modern hospitals and clinics with a strong reputation for patient experience, diagnostics, and coordinated care. Many facilities emphasize efficient workflows, thorough documentation, and clear follow-up steps—helpful if you want a well-structured plan you can keep organized over time.",
  },
  {
    country: "Sweden",
    image: "/destinations/sweden.jpg",
    cities: ["Stockholm", "Gothenburg"],
    specialties: ["Orthopedic", "Specialist Care"],
    note: "Nordic systems",
    description:
      "High standards and strong specialist care across major centers, supported by modern facilities and rigorous systems. Planning typically benefits from clear documentation and scheduling expectations, with an emphasis on safety and well-structured clinical processes throughout the journey.",
  },
  {
    country: "Norway",
    image: "/destinations/norway.jpg",
    cities: ["Oslo", "Bergen"],
    specialties: ["Specialist Care"],
    note: "Nordic systems",
    description:
      "Strong clinical standards and modern facilities in key regions, with an emphasis on safety and specialist care. It's best to arrive organized—records, questions, and timelines—since coordination can be more structured, and planning ahead makes follow-up smoother. Beautiful scenery",
  },
  {
    country: "Singapore",
    image: "/destinations/singapore.jpg",
    cities: ["Singapore"],
    specialties: ["Diagnostics", "Specialist Care"],
    note: "Top-tier facilities",
    description:
      "Internationally recognized hospitals and advanced diagnostics with a reputation for efficiency and high-quality specialist care. Many centers offer clear appointment pathways, transparent care coordination, and strong patient support—ideal if you want precise logistics and dependable standards.",
  },
  {
    country: "Ireland",
    image: "/destinations/ireland.jpg",
    cities: ["Dublin", "Cork"],
    specialties: ["Orthopedic", "Dental"],
    note: "EU standards",
    description:
      "A reliable option under EU-aligned standards, with modern hospitals and specialist networks in major cities. Many clinics provide a clear consultation structure, straightforward documentation needs, and practical recovery planning—helpful for keeping everything coordinated as you travel.",
  },
  {
    country: "Japan",
    image: "/destinations/japan.jpg",
    cities: ["Tokyo", "Osaka"],
    specialties: ["Diagnostics", "Specialist Care"],
    note: "Precision-focused",
    description:
      "World-class hospitals with meticulous clinical processes and a strong culture of precision and safety. Planning often works best with clear documentation, confirmed timelines, and organized follow-up steps—great if you value structured care pathways and thorough coordination.",
  },
  {
    country: "Netherlands",
    image: "/destinations/netherlands.jpg",
    cities: ["Amsterdam", "Rotterdam"],
    specialties: ["Orthopedic", "Specialist Care"],
    note: "EU standards",
    description:
      "Strong healthcare infrastructure with well-connected specialist networks and modern facilities across major cities. Many providers emphasize careful evaluation and documentation, so a structured plan—records, questions, and timelines—helps you compare options with confidence.",
  },
];

export function DestinationsSection() {
  const items = useMemo(() => destinations, []);
  const doubled = useMemo(() => [...items, ...items], [items]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);

  const xRef = useRef<number>(0);
  const loopWRef = useRef<number>(0);
  const stepRef = useRef<number>(0);
  const pausedRef = useRef<boolean>(false);
  const animatingRef = useRef<boolean>(false);

  const [hovered, setHovered] = useState<number | null>(null);
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const clampLoop = useCallback(() => {
    const loopW = loopWRef.current;
    if (!loopW) return;
    while (xRef.current <= -loopW) xRef.current += loopW;
    while (xRef.current > 0) xRef.current -= loopW;
  }, []);

  const applyX = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
  }, []);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const children = Array.from(track.children) as HTMLElement[];
    const half = Math.floor(children.length / 2);
    if (half <= 0) return;

    const first = children[0];
    const lastOfFirstSet = children[half - 1];

    const firstRect = first.getBoundingClientRect();
    const lastRect = lastOfFirstSet.getBoundingClientRect();

    loopWRef.current = lastRect.right - firstRect.left;

    if (children[1]) {
      const r0 = children[0].getBoundingClientRect();
      const r1 = children[1].getBoundingClientRect();
      stepRef.current = Math.max(1, r1.left - r0.left);
    }

    clampLoop();
    applyX();
  }, [applyX, clampLoop]);

  const animateTo = useCallback(
    (targetX: number, ms = 260) => {
      const startX = xRef.current;
      const start = performance.now();
      animatingRef.current = true;
      pausedRef.current = true;

      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / ms);
        const e = easeOutCubic(p);
        xRef.current = startX + (targetX - startX) * e;
        clampLoop();
        applyX();

        if (p < 1) requestAnimationFrame(tick);
        else {
          animatingRef.current = false;
          pausedRef.current = hovered !== null;
        }
      };

      requestAnimationFrame(tick);
    },
    [applyX, clampLoop, hovered]
  );

  const nudgeByOne = useCallback(
    (dir: -1 | 1) => {
      const step = stepRef.current || 320;
      const target = xRef.current - dir * step;
      animateTo(target, 260);
    },
    [animateTo]
  );

  useEffect(() => {
    measure();

    const ro = new ResizeObserver(() => measure());
    if (viewportRef.current) ro.observe(viewportRef.current);
    if (trackRef.current) ro.observe(trackRef.current);

    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    const tick = (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      if (!pausedRef.current && !animatingRef.current && loopWRef.current > 0) {
        xRef.current -= BASE_SPEED_PX_PER_SEC * dt;
        clampLoop();
        applyX();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      lastTsRef.current = 0;
    };
  }, [applyX, clampLoop]);

  const handleTiltMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const MAX = 8;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;

    const ry = (px - 0.5) * (MAX * 2);
    const rx = (0.5 - py) * (MAX * 2);

    setTilt({ rx, ry });
  }, []);

  return (
    <section
      className="pt-8 pb-12 lg:pt-12 lg:pb-14 bg-[hsl(77_23%_86%)] dark:bg-[hsl(80_19%_25%)]"
      aria-labelledby="destinations-heading"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-8">
          <h2 id="destinations-heading" className="text-3xl font-bold text-foreground sm:text-4xl text-balance">
            Destinations we cover
          </h2>
          <p className="mt-3 text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Countries selected for their healthcare infrastructure, provider standards, and support for international patients.
          </p>
        </div>

        <div className="relative">
          {/* Arrows */}
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center z-20">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="pointer-events-auto rounded-full shadow-sm"
              onClick={() => nudgeByOne(-1)}
              aria-label="Previous destination"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center z-20">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="pointer-events-auto rounded-full shadow-sm"
              onClick={() => nudgeByOne(1)}
              aria-label="Next destination"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* viewport */}
          <div
            ref={viewportRef}
            className="relative overflow-x-hidden overflow-y-visible py-10"
          >
            {/* Left fade overlay */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[hsl(77_23%_86%)] dark:from-[hsl(80_19%_25%)] to-transparent z-10" />

            {/* Right fade overlay */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[hsl(77_23%_86%)] dark:from-[hsl(80_19%_25%)] to-transparent z-10" />

            <div ref={trackRef} className="flex gap-6 will-change-transform" style={{ transform: "translate3d(0,0,0)" }} role="list">
              {doubled.map((dest, i) => {
                const isHovered = hovered === i;

                return (
                  <div
                    key={i}
                    role="listitem"
                    className="inline-block flex-shrink-0 align-top w-[300px] md:w-[340px] lg:w-[380px] px-2"
                    style={{ perspective: 600 }}
                    onMouseEnter={() => {
                      setHovered(i);
                      pausedRef.current = true;
                    }}
                    onMouseLeave={() => {
                      setHovered(null);
                      pausedRef.current = false;
                      setTilt({ rx: 0, ry: 0 });
                    }}
                    onMouseMove={isHovered ? handleTiltMove : undefined}
                  >
                    <Card
                      className={[
                        "relative overflow-hidden rounded-xl",
                        "bg-card dark:bg-card",
                        "border-0 outline-none ring-0",
                        "transition-all duration-300 ease-out",
                        isHovered
                          ? "shadow-[0_12px_26px_rgba(0,0,0,0.14),0_18px_34px_rgba(0,0,0,0.10),0_0_30px_hsl(var(--primary)/0.22)]"
                          : "shadow-[0_6px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.24)]",
                      ].join(" ")}
                      style={
                        isHovered && !prefersReducedMotion
                          ? {
                              transform: `translateY(-0.25rem) scale(1.03) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                              willChange: "transform",
                            }
                          : {
                              transform: "translateY(0) scale(1) rotateX(0deg) rotateY(0deg)",
                            }
                      }
                    >
                      {/* Bloom / glow overlay */}
                      <div
                        className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300"
                        style={{
                          background: "radial-gradient(ellipse at 50% 40%, hsl(var(--primary) / 0.16) 0%, transparent 70%)",
                          opacity: isHovered ? 1 : 0,
                        }}
                      />

                      <CardContent className="p-5 flex flex-col gap-3 relative z-10">
                        <div className="relative h-40 rounded-lg overflow-hidden">
                          <Image
                            src={dest.image}
                            alt={`${dest.country} destination`}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 flex flex-col gap-3">
                          <div>
                            <h3 className="text-xl font-bold text-foreground">
                              {dest.country}
                              <span
                                className="block h-[2px] bg-primary mt-1 transition-all duration-300 ease-out"
                                style={{ width: isHovered ? "100%" : "0%" }}
                              />
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-4 w-4" aria-hidden="true" />
                              <span>{dest.cities.join(", ")}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {dest.specialties.map((spec) => (
                              <Badge key={spec} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>

                          {dest.note && (
                            <p className="text-sm text-muted-foreground italic">{dest.note}</p>
                          )}

                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                            {dest.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
