"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Destination = {
  country: string;
  image: string;
  cities: string[];
  specialties: string[];
  note: string;
  description: string;
  topSpots: string[];
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
    topSpots: [
      "Bangkok floating markets & Grand Palace",
      "Phuket beaches & island hopping",
      "Chiang Mai temples & night bazaar",
      "Ayutthaya ancient ruins",
      "Thai massage & spa experiences",
    ],
  },
  {
    country: "Mexico",
    image: "/destinations/mexico.jpg",
    cities: ["Cancun", "Tijuana", "Monterrey", "Guadalajara"],
    specialties: ["Dental", "Bariatric", "Orthopedic"],
    note: "Proximity to the US",
    description:
      "Convenient travel from the United States with bilingual teams and growing international accreditation standards. Many providers are used to shorter trips, offering clear pre-visit instructions, defined care plans, and coordination for follow-ups—helpful if you're comparing options quickly and carefully.",
    topSpots: [
      "Cancun beaches & Mayan ruins",
      "Mexico City museums & historic center",
      "Tijuana craft beer & street food",
      "Playa del Carmen cenotes",
      "San Miguel de Allende colonial architecture",
    ],
  },
  {
    country: "Turkey",
    image: "/destinations/turkey.jpg",
    cities: ["Istanbul", "Antalya", "Ankara"],
    specialties: ["Hair Transplant", "Cosmetic", "Dental"],
    note: "Packages often available",
    description:
      "A major hub known for comprehensive packages and experienced specialists. Famous for its cosmetic procedures and hair transplants. Clinics often bundle logistics and provide clear post-procedure instructions, which helps when you want planning to stay simple and organized before you travel.",
    topSpots: [
      "Istanbul Hagia Sophia & Blue Mosque",
      "Cappadocia hot air balloons",
      "Turkish baths (hammam)",
      "Grand Bazaar shopping",
      "Bosphorus boat tours",
    ],
  },
  {
    country: "Spain",
    image: "/destinations/spain.jpg",
    cities: ["Barcelona", "Madrid"],
    specialties: ["Orthopedic", "Dental"],
    note: "EU standards",
    description:
      "Modern private hospitals and specialist clinics operate under strong EU safety and quality standards. Many centers support international patients with clear coordination, transparent care plans, and practical recovery guidance—making it easier to plan treatment alongside comfortable travel.",
    topSpots: [
      "Barcelona Sagrada Familia & Gaudí sites",
      "Madrid Prado Museum & tapas",
      "Costa del Sol beaches",
      "Flamenco shows",
      "Camino de Santiago pilgrimage",
    ],
  },
  {
    country: "Guatemala",
    image: "/destinations/guatemala.jpg",
    cities: ["Guatemala City", "Antigua"],
    specialties: ["Dental"],
    note: "Value-focused",
    description:
      "A popular choice for value-focused dental care, with many clinics accustomed to international visitors. Expect straightforward scheduling, clear pricing for common procedures, and practical logistics for shorter stays—especially when you want a simpler plan with minimal recovery overhead.",
    topSpots: [
      "Antigua colonial streets & ruins",
      "Lake Atitlán & Mayan villages",
      "Tikal jungle temples",
      "Local coffee plantation tours",
      "Semuc Champey natural pools",
    ],
  },
  {
    country: "South Korea",
    image: "/destinations/south-korea.jpg",
    cities: ["Seoul", "Busan"],
    specialties: ["Cosmetic", "Dermatology"],
    note: "Specialist expertise",
    description:
      "Known for highly specialized cosmetic and dermatology clinics with advanced technology and meticulous process. Many practices offer structured consultations, detailed aftercare instructions, and dedicated coordinators—helpful if you want an organized experience with clear steps and expectations.",
    topSpots: [
      "Seoul K-pop culture & shopping",
      "Korean BBQ & street food tours",
      "Busan beaches & seafood markets",
      "DMZ tours",
      "Korean spa (jjimjilbang) experience",
    ],
  },
  {
    country: "Vietnam",
    image: "/destinations/vietnam.jpg",
    cities: ["Ho Chi Minh City", "Hanoi"],
    specialties: ["Dental", "Cosmetic"],
    note: "Affordable care",
    description:
      "An expanding medical tourism ecosystem in major cities, offering strong value for dental and cosmetic procedures. Many clinics provide clear pre-visit guidance, packaged coordination support, and practical recovery planning—useful if you want dependable logistics at a lower cost.",
    topSpots: [
      "Hanoi Old Quarter street food",
      "Ha Long Bay cruises",
      "Hoi An lantern festival & tailors",
      "Mekong Delta boat tours",
      "War Remnants Museum",
    ],
  },
  {
    country: "Cuba",
    image: "/destinations/cuba.jpg",
    cities: ["Havana"],
    specialties: ["General Care"],
    note: "Public system",
    description:
      "Historically recognized for medical training and a large public healthcare system, with some services accessed through structured programs. Travel logistics can be more specific than other destinations, so planning often benefits from clear documentation, expectations, and step-by-step coordination.",
    topSpots: [
      "Havana classic cars & Malecón",
      "Viñales tobacco farms",
      "Trinidad colonial town",
      "Cuban cigars & rum distilleries",
      "Salsa dancing & live music",
    ],
  },
  {
    country: "Taiwan",
    image: "/destinations/taiwan.jpg",
    cities: ["Taipei", "Taichung"],
    specialties: ["Dental", "Diagnostics"],
    note: "High quality",
    description:
      "Modern hospitals and clinics with a strong reputation for patient experience, diagnostics, and coordinated care. Many facilities emphasize efficient workflows, thorough documentation, and clear follow-up steps—helpful if you want a well-structured plan you can keep organized over time.",
    topSpots: [
      "Taipei 101 & night markets",
      "Taroko Gorge hiking",
      "Hot springs & tea plantations",
      "Night market street food",
      "Sun Moon Lake",
    ],
  },
  {
    country: "Sweden",
    image: "/destinations/sweden.jpg",
    cities: ["Stockholm", "Gothenburg"],
    specialties: ["Orthopedic", "Specialist Care"],
    note: "Nordic systems",
    description:
      "High standards and strong specialist care across major centers, supported by modern facilities and rigorous systems. Planning typically benefits from clear documentation and scheduling expectations, with an emphasis on safety and well-structured clinical processes throughout the journey.",
    topSpots: [
      "Stockholm Old Town (Gamla Stan)",
      "Åre skiing & snowboarding",
      "Northern lights tours (Lapland)",
      "Vasa Museum",
      "Swedish fika (coffee & pastries)",
    ],
  },
  {
    country: "Norway",
    image: "/destinations/norway.jpg",
    cities: ["Oslo", "Bergen"],
    specialties: ["Specialist Care"],
    note: "Nordic systems",
    description:
      "Strong clinical standards and modern facilities in key regions, with an emphasis on safety and specialist care. It's best to arrive organized—records, questions, and timelines—since coordination can be more structured, and planning ahead makes follow-up smoother. Beautiful scenery",
    topSpots: [
      "Oslo Viking Ship Museum",
      "Bergen fjord tours",
      "Northern lights viewing",
      "Flåm Railway scenic train",
      "Midnight sun experiences",
    ],
  },
  {
    country: "Singapore",
    image: "/destinations/singapore.jpg",
    cities: ["Singapore"],
    specialties: ["Diagnostics", "Specialist Care"],
    note: "Top-tier facilities",
    description:
      "Internationally recognized hospitals and advanced diagnostics with a reputation for efficiency and high-quality specialist care. Many centers offer clear appointment pathways, transparent care coordination, and strong patient support—ideal if you want precise logistics and dependable standards.",
    topSpots: [
      "Gardens by the Bay",
      "Marina Bay Sands & waterfront",
      "Hawker centers street food",
      "Sentosa Island beaches",
      "Little India & Chinatown",
    ],
  },
  {
    country: "Ireland",
    image: "/destinations/ireland.jpg",
    cities: ["Dublin", "Cork"],
    specialties: ["Orthopedic", "Dental"],
    note: "EU standards",
    description:
      "A reliable option under EU-aligned standards, with modern hospitals and specialist networks in major cities. Many clinics provide a clear consultation structure, straightforward documentation needs, and practical recovery planning—helpful for keeping everything coordinated as you travel.",
    topSpots: [
      "Dublin Temple Bar & Guinness Storehouse",
      "Cliffs of Moher",
      "Ring of Kerry scenic drive",
      "Traditional Irish pubs & music",
      "Trinity College & Book of Kells",
    ],
  },
  {
    country: "Japan",
    image: "/destinations/japan.jpg",
    cities: ["Tokyo", "Osaka"],
    specialties: ["Diagnostics", "Specialist Care"],
    note: "Precision-focused",
    description:
      "World-class hospitals with meticulous clinical processes and a strong culture of precision and safety. Planning often works best with clear documentation, confirmed timelines, and organized follow-up steps—great if you value structured care pathways and thorough coordination.",
    topSpots: [
      "Tokyo Pokémon Center & Akihabara",
      "Kyoto temples & bamboo forests",
      "Tokyo food markets (Tsukiji)",
      "Mount Fuji views & hot springs",
      "Cherry blossom viewing (sakura)",
    ],
  },
  {
    country: "Netherlands",
    image: "/destinations/netherlands.jpg",
    cities: ["Amsterdam", "Rotterdam"],
    specialties: ["Orthopedic", "Specialist Care"],
    note: "EU standards",
    description:
      "Strong healthcare infrastructure with well-connected specialist networks and modern facilities across major cities. Many providers emphasize careful evaluation and documentation, so a structured plan—records, questions, and timelines—helps you compare options with confidence.",
    topSpots: [
      "Amsterdam canals & cycling",
      "Van Gogh Museum",
      "Keukenhof tulip gardens",
      "Rotterdam modern architecture",
      "Cheese markets & windmills",
    ],
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
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Drag detection for carousel
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleFlip = useCallback((index: number) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
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
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 1.6%, rgba(0,0,0,1) 98.4%, rgba(0,0,0,0) 100%)",
              maskImage:
                "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 1.6%, rgba(0,0,0,1) 98.4%, rgba(0,0,0,0) 100%)",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
            }}
            onPointerDown={(e) => {
              dragStartRef.current = { x: e.clientX, y: e.clientY };
              isDraggingRef.current = false;
            }}
            onPointerMove={(e) => {
              if (dragStartRef.current) {
                const dx = Math.abs(e.clientX - dragStartRef.current.x);
                const dy = Math.abs(e.clientY - dragStartRef.current.y);
                if (dx > 6 || dy > 6) isDraggingRef.current = true;
              }
            }}
            onPointerUp={() => {
              dragStartRef.current = null;
              isDraggingRef.current = false;
            }}
          >
            <div ref={trackRef} className="flex gap-6 will-change-transform" style={{ transform: "translate3d(0,0,0)" }} role="list">
              {doubled.map((dest, i) => {
                const isHovered = hovered === i;
                const isFlipped = flipped.has(i);

                return (
                  {/* Outer: perspective wrapper */}
                  <div
                    key={i}
                    className="inline-block flex-shrink-0 align-top w-[300px] md:w-[340px] lg:w-[380px] px-2 perspective-1000"
                    onMouseEnter={() => {
                      setHovered(i);
                      pausedRef.current = true;
                    }}
                    onMouseLeave={() => {
                      setHovered(null);
                      pausedRef.current = isFlipped;
                      setTilt({ rx: 0, ry: 0 });
                    }}
                    onMouseMove={isHovered && !isFlipped ? handleTiltMove : undefined}
                  >
                    {/* Inner: transform container with preserve-3d, rotates on flip */}
                    <div
                      className={[
                        "relative w-full preserve-3d",
                        prefersReducedMotion ? "flip-card-transition-reduced" : "flip-card-transition",
                        isFlipped ? "rotate-y-180" : "",
                      ].join(" ")}
                      style={{ minHeight: "500px" }}
                    >
                      {/* Front face: backface-hidden, absolute positioned */}
                      <div
                        className="backface-hidden absolute inset-0 w-full h-full"
                      >
                    {/* Flip container */}
                    <div
                      className="relative w-full"
                      style={{
                        transformStyle: "preserve-3d",
                        transition: prefersReducedMotion ? "opacity 0.3s ease-out" : "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                        minHeight: "500px",
                      }}
                    >
                      {/* Front side */}
                      <div
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        {/* OUTER WRAPPER so glow is NOT clipped and no “box line” */}
                        <div className="relative h-full">
                          <div
                            aria-hidden="true"
                            className={[
                              "pointer-events-none absolute -inset-10 rounded-[28px] blur-2xl",
                              "transition-opacity duration-300 ease-out",
                              "bg-[radial-gradient(60%_60%_at_50%_18%,hsl(var(--primary)/0.38),transparent_70%)]",
                              isHovered && !isFlipped ? "opacity-100" : "opacity-0",
                            ].join(" ")}
                          />

                          <Card
                            className={[
                              "relative z-10 group overflow-hidden rounded-xl backdrop-blur-sm h-full",
                              "bg-[hsl(77_30%_97%)] dark:bg-[hsl(80_18%_33%)]",
                              "border-0 outline-none ring-0",
                              "transition-[transform,box-shadow] duration-200 ease-out",
                              // shadow designed to avoid a “hard baseline”
                              "shadow-[0_18px_44px_-34px_rgba(0,0,0,0.28)] dark:shadow-[0_22px_54px_-38px_rgba(0,0,0,0.62)]",
                              isHovered && !isFlipped
                                ? "shadow-[0_28px_78px_-54px_rgba(0,0,0,0.38)] dark:shadow-[0_34px_92px_-62px_rgba(0,0,0,0.78)]"
                                : "",
                            ].join(" ")}
                            role="listitem"
                            style={
                              isHovered && !isFlipped && !prefersReducedMotion
                                ? {
                                  transform: `translateY(-0.25rem) scale(1.035) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                                  transformStyle: "preserve-3d",
                                  willChange: "transform",
                                }
                                : undefined
                            }
                          >
                            {/* Image header */}
                            <div className="relative h-32 bg-primary/5">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <MapPin className="h-10 w-10 text-primary/40" aria-hidden="true" />
                              </div>

                              <Image
                                src={dest.image}
                                alt={`${dest.country} destination`}
                                fill
                                className={[
                                  "object-cover transition-[transform,filter] duration-450 ease-out",
                                  isHovered && !isFlipped ? "scale-[1.05] -translate-y-0.5 saturate-[1.04] contrast-[1.02]" : "scale-100 translate-y-0",
                                ].join(" ")}
                                sizes="(min-width: 1024px) 380px, (min-width: 640px) 340px, 300px"
                                priority={dest.country === "Thailand"}
                              />

                              <div
                                className={[
                                  "absolute inset-0 bg-gradient-to-t to-transparent transition-opacity duration-450",
                                  isHovered && !isFlipped ? "from-black/22" : "from-black/32",
                                ].join(" ")}
                              />

                              {/* Sheen */}
                              <div
                                aria-hidden="true"
                                className={[
                                  "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200",
                                  isHovered && !isFlipped ? "opacity-100" : "",
                                ].join(" ")}
                              >
                                <div
                                  className={[
                                    "absolute -inset-y-12 -left-[70%] w-[60%] rotate-12",
                                    "bg-gradient-to-r from-transparent via-white/14 to-transparent dark:via-white/8",
                                    "blur-lg",
                                    isHovered && !isFlipped
                                      ? "translate-x-[360%] transition-transform duration-[2400ms] ease-out"
                                      : "translate-x-[0%] transition-transform duration-0",
                                  ].join(" ")}
                                />
                              </div>
                            </div>

                            <CardContent className="p-5">
                              <div className="flex items-center justify-between mb-3 gap-2">
                                <h3 className="text-xl font-bold text-foreground">
                                  <span className="relative inline-block">
                                    {dest.country}
                                    <span
                                      aria-hidden="true"
                                      className={[
                                        "absolute -bottom-1 left-0 h-[2px] bg-primary/60 transition-all duration-200",
                                        isHovered && !isFlipped ? "w-full" : "w-0",
                                      ].join(" ")}
                                    />
                                  </span>
                                </h3>

                                <span className={isHovered && !isFlipped ? "translate-y-[-1px] transition-transform duration-200" : "transition-transform duration-200"}>
                                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">{dest.note}</Badge>
                                </span>
                              </div>

                              <p className="text-sm text-muted-foreground leading-relaxed mb-4 min-h-[88px]">{dest.description}</p>

                              <div className="flex flex-wrap gap-1.5">
                                {dest.specialties.slice(0, 3).map((s) => (
                                  <Badge
                                    key={s}
                                    variant="secondary"
                                    className={[
                                      "text-xs transition-[transform,opacity] duration-200",
                                      isHovered && !isFlipped ? "-translate-y-0.5 opacity-100" : "translate-y-0 opacity-95",
                                    ].join(" ")}
                                  >
                                    {s}
                                  </Badge>
                                ))}
                              </div>

                              <p className="text-xs text-muted-foreground mt-3 mb-4">Cities: {dest.cities.join(", ")}</p>

                              {/* Flip button (no drag gate; always flips) */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFlip(i);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleFlip(i);
                                  }
                                }}
                                className="w-full py-2 px-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors rounded-md hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                aria-label={`View top spots in ${dest.country}`}
                              >
                                View top spots →
                              </button>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      {/* Back face: backface-hidden, absolute positioned, rotated 180deg */}
                      <div
                        className="backface-hidden rotate-y-180 absolute inset-0 w-full h-full"
                      >
                        {/* wrapper so back also looks “glowy” and consistent */}
                        <div className="relative h-full">
                          <div
                            aria-hidden="true"
                            className={[
                              "pointer-events-none absolute -inset-10 rounded-[28px] blur-2xl",
                              "transition-opacity duration-300 ease-out",
                              "bg-[radial-gradient(60%_60%_at_50%_18%,hsl(var(--primary)/0.30),transparent_70%)]",
                              isHovered ? "opacity-100" : "opacity-0",
                            ].join(" ")}
                          />

                          <Card
                            className={[
                              "relative z-10 overflow-hidden rounded-xl backdrop-blur-sm h-full",
                              "bg-[hsl(77_30%_97%)] dark:bg-[hsl(80_18%_33%)]",
                              "border-0 outline-none ring-0",
                              "shadow-[0_18px_44px_-34px_rgba(0,0,0,0.28)] dark:shadow-[0_22px_54px_-38px_rgba(0,0,0,0.62)]",
                            ].join(" ")}
                          >
                            <CardContent className="p-5 h-full flex flex-col">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-foreground">{dest.country}</h3>
                                <Badge className="bg-primary/10 text-primary border-0">Top Spots</Badge>
                              </div>

                              <div className="flex-1">
                                <p className="text-sm font-semibold text-foreground mb-3">Things to explore:</p>
                                <ul className="space-y-2.5 mb-4">
                                  {dest.topSpots.map((spot, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                      <span className="text-primary shrink-0 mt-0.5">•</span>
                                      <span>{spot}</span>
                                    </li>
                                  ))}
                                </ul>

                                <p className="text-xs text-muted-foreground border-t border-border pt-3">
                                  <span className="font-semibold text-foreground">Cities:</span> {dest.cities.join(", ")}
                                </p>
                              </div>

                              {/* Back button (always flips back) */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFlip(i);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleFlip(i);
                                  }
                                }}
                                className="mt-4 w-full py-2 px-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors rounded-md hover:bg-primary/5 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                aria-label={`Go back to ${dest.country} overview`}
                              >
                                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                                Back to overview
                              </button>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
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
