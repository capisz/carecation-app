"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { SmartLink } from "./smart-link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, Info, Sun, Moon, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { useOverlay } from "./overlay/overlay-provider";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/intake", label: "Plan Trip" },
  { href: "/results", label: "Providers" },
  { href: "/admin/providers", label: "Admin" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { runNavOverlay } = useOverlay();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  const handleCarePlan = () => {
    runNavOverlay("/intake");
    router.push("/intake");
  };

  const handleProviders = () => {
    router.push("/providers");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
       <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2" aria-label="Carecation home">
            {/* Bigger logo here */}
           <span className="relative block h-7 w-7 shrink-0">
              <Image
                src="/brand/carecation-heart-light.png"
                alt="Carecation logo"
                fill
                sizes="28px"
                priority
                className="object-contain dark:hidden"
              />
              <Image
                src="/brand/carecation-heart-dark.png"
                alt="Carecation logo"
                fill
                sizes="28px"
                priority
                className="hidden object-contain dark:block"
              />
            </span>

<span className="text-3xl font-bold tracking-tight text-foreground">
              Care<span className="text-primary">cation</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <SmartLink
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </SmartLink>
            ))}
          </nav>

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

            <Button variant="outline" onClick={handleProviders}>
              For Providers
            </Button>

            <Button onClick={handleCarePlan} onMouseEnter={() => router.prefetch("/intake")}>
              Begin your care plan
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
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
              {navLinks.map((link) => (
                <SmartLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </SmartLink>
              ))}

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

                <Button variant="outline" className="flex-1" onClick={() => { setMobileOpen(false); handleProviders(); }}>
                  For Providers
                </Button>

                <Button className="flex-1" onClick={() => { setMobileOpen(false); handleCarePlan(); }}>
                  Begin your care plan
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
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
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              {/* Slightly bigger footer logo too */}
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

              <span className="font-semibold text-foreground">Carecation</span>
            </div>

            <p className="text-sm text-muted-foreground text-center md:text-right">
              Helping you explore healthcare options abroad with clarity and confidence.
            </p>
          </div>

          <div
            className="rounded-lg border border-border bg-muted/50 p-4 flex items-start gap-3"
            role="note"
            aria-label="Medical disclaimer"
          >
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="font-semibold text-foreground">Not medical advice.</strong>{" "}
              Carecation is an informational planning tool only. The content on this site does not
              constitute medical advice, diagnosis, or treatment recommendations. Always consult
              a qualified healthcare professional before making decisions about medical procedures.
              Provider information, pricing, and accreditations are self-reported and should be
              independently verified. Travel for medical care involves risks that you should
              discuss with your personal physician.
            </p>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            All provider data shown is for demonstration purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
