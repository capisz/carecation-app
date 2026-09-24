"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FolderOpen, Heart, LogIn, Plane } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useOverlay } from "./overlay/overlay-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { readItineraryPlan, ITINERARY_PLAN_UPDATED_EVENT, type ItineraryPlan } from "@/lib/itinerary-plan";

const navItems = [
  { label: "Care", href: "/clinics" },
  { label: "Travel", href: "/travel" },
  { label: "My trip", href: "/itinerary" },
];
const footerItems = [
  ["Testimonials", "/testimonials"], ["Transparency", "/privacy"], ["Feedback", "/support"],
  ["Privacy", "/privacy"], ["Terms", "/terms"], ["Providers", "/providers"],
];
function hasStartedItinerary(plan: ItineraryPlan) {
  return Boolean(plan.flight?.id || plan.hotel?.id || plan.hotel?.hotelId || plan.hotel?.name || plan.healthcareEstimate?.providerId || plan.healthcareEstimate?.providerName);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { runNavOverlay } = useOverlay();
  const [hasPlan, setHasPlan] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [navCondensed, setNavCondensed] = useState(false);

  useEffect(() => {
    if (pathname === "/intake" || pathname === "/login") return;

    let scrollAnchor = window.scrollY;
    setNavCondensed(scrollAnchor > 28);

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const movement = currentScroll - scrollAnchor;

      if (currentScroll <= 28) {
        setNavCondensed(false);
        scrollAnchor = currentScroll;
      } else if (movement >= 5) {
        setNavCondensed(true);
        scrollAnchor = currentScroll;
      } else if (movement <= -5) {
        setNavCondensed(false);
        scrollAnchor = currentScroll;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  useEffect(() => {
    const sync = () => {
      const started = hasStartedItinerary(readItineraryPlan());
      setHasPlan(started);
      if (!started) fetch("/api/plans/active").then((r) => r.ok ? r.json() : null).then((data) => setHasPlan(Boolean(data?.plan?.plan_snapshot))).catch(() => {});
    };
    sync(); window.addEventListener("storage", sync); window.addEventListener("focus", sync); window.addEventListener(ITINERARY_PLAN_UPDATED_EVENT, sync);
    return () => { window.removeEventListener("storage", sync); window.removeEventListener("focus", sync); window.removeEventListener(ITINERARY_PLAN_UPDATED_EVENT, sync); };
  }, []);
  useEffect(() => {
    const client = getSupabaseBrowserClient(); if (!client) return;
    let mounted = true;
    client.auth.getUser().then(({ data }) => { if (mounted) setEmail(data.user?.email ?? null); });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => setEmail(session?.user.email ?? null));
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const start = () => { runNavOverlay("/intake"); router.push("/intake"); };
  const actionLabel = "Start your plan";
  const action = start;

  return <div className="min-h-screen flex flex-col">
    {pathname !== "/intake" && pathname !== "/login" && <header data-screen className={`care-nav ${navCondensed ? "is-condensed" : ""}`}>
      <Link href="/" className="care-brand" aria-label="Carecation home">
        <span className="care-brand-mark"><Image src="/brand/carecation-heart-light.png" alt="" fill sizes="22px" className="object-contain dark:hidden" priority /><Image src="/brand/carecation-heart-dark.png" alt="" fill sizes="22px" className="hidden object-contain dark:block" priority /></span>
        <span className="care-brand-name">Care<span>cation</span></span>
      </Link>
      <nav className="care-nav-links" aria-label="Main navigation">
        {navItems.map((item) => { const active = pathname === item.href || pathname.startsWith(`${item.href}/`) || (item.href === "/clinics" && pathname === "/results"); return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={active ? "active" : ""}>{item.label}</Link>; })}
        <Link href={email ? "/account/plans" : "/login"} aria-current={pathname === "/login" ? "page" : undefined}>{email ? <><FolderOpen size={15} /> My plans</> : <><LogIn size={15} /> Sign in</>}</Link>{email && <Link href="/auth/logout">Sign out</Link>}
      </nav>
      <div className="care-nav-actions"><ThemeToggle />{pathname === "/itinerary" && hasPlan ? <button type="button" className="care-nav-cta" onClick={() => window.dispatchEvent(new Event("carecation:open-print-preview"))}>Print</button> : <button type="button" className="care-nav-cta" aria-label={actionLabel} title={actionLabel} onClick={action}><span className="care-nav-cta-label">{actionLabel}</span><Plane size={15} className="rotate-45" aria-hidden="true" /></button>}</div>
    </header>}
    <main id="main-content" className="flex-1">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Skip to content</a>
      {children}
    </main>
    {pathname !== "/intake" && pathname !== "/login" && <footer data-screen className="care-footer" role="contentinfo">
      <Link href="/" className="care-footer-brand"><Heart size={18} fill="currentColor" /> Carecation</Link>
      <nav aria-label="Footer links">{footerItems.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</nav>
      <span>© {new Date().getFullYear()} · Not medical advice</span>
    </footer>}
  </div>;
}
