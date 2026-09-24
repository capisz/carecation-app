"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, FolderOpen, Heart, LogIn } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useOverlay } from "./overlay/overlay-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { readItineraryPlan, ITINERARY_PLAN_UPDATED_EVENT, type ItineraryPlan } from "@/lib/itinerary-plan";

const navItems = [
  { label: "Care", href: "/clinics" },
  { label: "Travel", href: "/travel" },
  { label: "Testimonials", href: "/testimonials" },
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
  const [condensed, setCondensed] = useState(false);
  const [providerCondensed, setProviderCondensed] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [hasPlan, setHasPlan] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => { setCondensed(window.scrollY > 72); setProviderCondensed(window.scrollY > 420); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!pathname.startsWith("/provider/")) return;
    const ids = ["overview", "cost", "reviews", "logistics"];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: "-40% 0px -45% 0px" });
    ids.forEach((id) => { const element = document.getElementById(id); if (element) observer.observe(element); });
    return () => observer.disconnect();
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
  const actionLabel = hasPlan ? "My trip" : "Start your plan";
  const action = () => { if (hasPlan) router.push("/itinerary"); else start(); };
  const providerPage = pathname.startsWith("/provider/");
  const links = providerPage && providerCondensed
    ? [{ label:"Overview", href:"#overview" }, { label:"Cost", href:"#cost" }, { label:"Reviews", href:"#reviews" }, { label:"Logistics", href:"#logistics" }]
    : navItems;

  return <div className="min-h-screen flex flex-col">
    {pathname !== "/intake" && pathname !== "/login" && <header className={`care-nav ${condensed ? "is-condensed" : ""}`}>
      <Link href="/" className="care-brand" aria-label="Carecation home">
        <span className="care-brand-mark"><Image src="/brand/carecation-heart-light.png" alt="" fill sizes="22px" className="object-contain dark:hidden" priority /><Image src="/brand/carecation-heart-dark.png" alt="" fill sizes="22px" className="hidden object-contain dark:block" priority /></span>
        <span>Care<span>cation</span></span>
      </Link>
      <nav className={`care-nav-links ${providerPage && providerCondensed ? "provider-links" : ""}`} aria-label="Main navigation">
        {links.map((item) => { const active = item.href.startsWith("#") ? activeSection === item.href.slice(1) : pathname === item.href; return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={active ? "active" : ""}>{item.label}</Link>; })}
        {!providerPage || !providerCondensed ? <><Link href={email ? "/account/plans" : "/login"} aria-current={pathname === "/login" ? "page" : undefined}>{email ? <><FolderOpen size={15} /> My plans</> : <><LogIn size={15} /> Sign in</>}</Link>{email && <Link href="/auth/logout">Sign out</Link>}</> : null}
      </nav>
      <div className="care-nav-actions"><ThemeToggle />{pathname === "/itinerary" ? <button type="button" className="care-nav-cta" onClick={() => window.print()}>Print</button> : <button type="button" className="care-nav-cta" onClick={action}>{actionLabel}<ArrowRight size={15} /></button>}</div>
    </header>}
    <main id="main-content" className="flex-1">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Skip to content</a>
      {children}
    </main>
    {pathname !== "/intake" && pathname !== "/login" && <footer className="care-footer" role="contentinfo">
      <Link href="/" className="care-footer-brand"><Heart size={18} fill="currentColor" /> Carecation</Link>
      <nav aria-label="Footer links">{footerItems.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</nav>
      <span>© {new Date().getFullYear()} · Not medical advice</span>
    </footer>}
  </div>;
}
