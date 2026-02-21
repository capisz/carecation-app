"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SmartLink } from "./smart-link";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { useOverlay } from "./overlay/overlay-provider";
import {
  clearItineraryPlan,
  readItineraryPlan,
  ITINERARY_PLAN_UPDATED_EVENT,
  type ItineraryPlan,
} from "@/lib/itinerary-plan";

const footerHeaderLinks = [
  { label: "Testimonials", href: "/testimonials" },
  { label: "Transparency", href: "#footer-transparency" },
  { label: "Feedback", href: "#footer-feedback" },
];

const footerColumns = [
  {
    title: "Overview",
    links: [
      { label: "Browse Care", href: "/clinics" },
      { label: "Browse Travel", href: "/travel" },
      { label: "Plan Your Care", href: "/intake" },
      { label: "About", href: "#footer-about" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "FAQ", href: "#footer-faq", id: "footer-faq" },
      { label: "Customer Support", href: "#footer-feedback", id: "footer-feedback" },
      { label: "Legal", href: "#footer-transparency", id: "footer-transparency" },
      { label: "Request Form", href: "/request" },
    ],
  },
  {
    title: "For Providers",
    links: [
      { label: "Provider Application", href: "/providers" },
      { label: "Provider Info", href: "#footer-providers", id: "footer-providers" },
      { label: "Directory Standards", href: "#footer-transparency" },
    ],
  },
];

function hasStartedItinerary(plan: ItineraryPlan): boolean {
  const hasFlight = Boolean(plan.flight?.id);
  const hasHotel = Boolean(plan.hotel?.id || plan.hotel?.hotelId || plan.hotel?.name);
  const hasHealthcareEstimate = Boolean(
    plan.healthcareEstimate?.providerId || plan.healthcareEstimate?.providerName,
  );

  return hasFlight || hasHotel || hasHealthcareEstimate;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { runNavOverlay } = useOverlay();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasStartedPlan, setHasStartedPlan] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const syncPlanState = () => {
      const plan = readItineraryPlan();
      const started = hasStartedItinerary(plan);
      setHasStartedPlan(started);
    };

    syncPlanState();
    window.addEventListener("storage", syncPlanState);
    window.addEventListener("focus", syncPlanState);
    window.addEventListener(ITINERARY_PLAN_UPDATED_EVENT, syncPlanState);

    return () => {
      window.removeEventListener("storage", syncPlanState);
      window.removeEventListener("focus", syncPlanState);
      window.removeEventListener(ITINERARY_PLAN_UPDATED_EVENT, syncPlanState);
    };
  }, []);

  const handleStartCarePlan = () => {
    runNavOverlay("/intake");
    router.push("/intake");
  };

  const handleRestartCarePlan = () => {
    clearItineraryPlan();
    setHasStartedPlan(false);
    runNavOverlay("/intake");
    router.push("/intake");
  };
  const handleViewItinerary = () => {
    runNavOverlay("/itinerary");
    router.push("/itinerary");
  };
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2 md:gap-3" aria-label="Carecation home">
            {/* Bigger logo here */}
            <span className="relative hidden h-7 w-7 shrink-0 sm:block">
              <Image
                src="/brand/carecation-heart-light.png"
                alt="Carecation logo"
                fill
                sizes="40px"
                className="object-contain dark:hidden"
                priority
              />
              <Image
                src="/brand/carecation-heart-dark.png"
                alt="Carecation logo"
                fill
                sizes="40px"
                className="hidden object-contain dark:block"
                priority
              />
            </span>

            <span className="flex flex-col leading-none">
              <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Care<span className="text-primary">cation</span>
              </span>
              <span className="hidden md:block whitespace-nowrap text-[11px] text-muted-foreground">
                Healthcare meets adventure.
              </span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme((resolvedTheme ?? "light") === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              suppressHydrationWarning
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
            </Button>

            {hasStartedPlan ? (
              <>
                <Button
                  onClick={handleRestartCarePlan}
                  onMouseEnter={() => router.prefetch("/intake")}
                >
                  Restart care plan
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  onClick={handleViewItinerary}
                  onMouseEnter={() => router.prefetch("/itinerary")}
                >
                  View itinerary
                </Button>
              </>
            ) : (
              <Button
                onClick={handleStartCarePlan}
                onMouseEnter={() => router.prefetch("/intake")}
              >
                Begin your care plan
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </Button>
        </div>

        {mobileOpen && (
          <div id="mobile-menu" className="md:hidden border-t bg-card px-4 pb-4">
            <nav className="flex flex-col gap-1 pt-2" aria-label="Mobile navigation">
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme((resolvedTheme ?? "light") === "dark" ? "light" : "dark")}
                  aria-label="Toggle theme"
                  suppressHydrationWarning
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
                </Button>

                {hasStartedPlan ? (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setMobileOpen(false);
                      handleRestartCarePlan();
                    }}
                  >
                    Restart care plan
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setMobileOpen(false);
                      handleStartCarePlan();
                    }}
                  >
                    Begin your care plan
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
              </div>
              {hasStartedPlan && (
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setMobileOpen(false);
                      handleViewItinerary();
                    }}
                  >
                    View itinerary
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <main id="main-content" className="flex-1">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
        >
          Skip to main content
        </a>
        {children}
      </main>

      <footer className="border-t bg-card" role="contentinfo">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-12">
          <div className="flex flex-col gap-10">
            <div className="grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
              <div className="flex items-center gap-2">
                <span className="relative block h-5 w-5 shrink-0">
                  <Image
                    src="/brand/carecation-heart-light.png"
                    alt="Carecation logo"
                    fill
                    sizes="24px"
                    className="object-contain dark:hidden"
                  />
                  <Image
                    src="/brand/carecation-heart-dark.png"
                    alt="Carecation logo"
                    fill
                    sizes="24px"
                    className="hidden object-contain dark:block"
                  />
                </span>
                <span className="flex flex-col leading-none">
                  <span className="text-xl font-semibold text-foreground">
                    Care<span className="text-primary">cation</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Healthcare meets adventure.
                  </span>
                </span>
              </div>

              <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 lg:justify-center" aria-label="Footer information links">
                {footerHeaderLinks.map((link) =>
                  link.href.startsWith("#") ? (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <SmartLink
                      key={link.label}
                      href={link.href}
                      className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {link.label}
                    </SmartLink>
                  ),
                )}
              </nav>

              <div className="flex items-center gap-3 lg:justify-self-end">
                {hasStartedPlan ? (
                  <>
                    <Button onClick={handleRestartCarePlan}>
                      Restart care plan
                    </Button>
                    <Button onClick={handleViewItinerary}>
                      View itinerary
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleStartCarePlan}>
                    Begin your care plan
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
              <div className="space-y-4">
                <p
                  id="footer-about"
                  className="max-w-2xl text-xl italic leading-snug text-foreground/90"
                >
                  "Our mission is to help people navigate international healthcare with opporunity for adventure & discovery." 
                 
                </p>
                <p id="footer-about"
                  className="max-w-2xl text-md italic leading-snug text-foreground/90"
                > -Carecation CEO</p>
              </div>

              {footerColumns.map((column) => (
                <div key={column.title} className="space-y-3">
                  <h4 className="text-2xl font-semibold text-foreground">{column.title}</h4>
                  <ul className="space-y-2 text-sm">
                    {column.links.map((link) => (
                      <li key={`${column.title}-${link.label}`} id={link.id}>
                        {link.href.startsWith("#") ? (
                          <a href={link.href} className="text-muted-foreground underline underline-offset-4 hover:text-foreground">
                            {link.label}
                          </a>
                        ) : (
                          <SmartLink href={link.href} className="text-muted-foreground underline underline-offset-4 hover:text-foreground">
                            {link.label}
                          </SmartLink>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 border-t border-border pt-6">
              <div>
                <p className="text-sm text-foreground">Copyright {currentYear} Carecation.</p>
                <p className="text-sm italic text-muted-foreground">
Healthcare meets adventure.                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Not medical advice. Always verify provider credentials and consult licensed healthcare professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
