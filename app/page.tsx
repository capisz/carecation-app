import { AppShell } from "@/components/app-shell";
import { FlagParallaxBackground } from "@/components/landing/flag-parallax-background";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { DestinationsSection } from "@/components/landing/destinations-section";
import { TrustSection } from "@/components/landing/trust-section";
import { CtaSection } from "@/components/landing/cta-section";
import { ScrollSyncedDividerPlane } from "@/components/landing/scroll-synced-divider-plane";

export default function HomePage() {
  return (
    <AppShell>
      <div id="hero">
        <FlagParallaxBackground>
          <HeroSection />
        </FlagParallaxBackground>
      </div>

      {/* Plane rides THIS divider while you scroll through HowItWorks toward Destinations */}
<section id="how" className="relative overflow-visible border-t border-border">
        <ScrollSyncedDividerPlane startId="how" endId="destinations" />
        <ScrollReveal delay={0}>
          <HowItWorks />
        </ScrollReveal>
      </section>

<section id="destinations" className="relative overflow-visible border-t border-border">
        <ScrollSyncedDividerPlane startId="destinations" endId="trust" />
        <ScrollReveal delay={0.1}>
          <DestinationsSection />
        </ScrollReveal>
      </section>

<section id="trust" className="relative overflow-visible border-t border-border">
        <ScrollSyncedDividerPlane startId="trust" endId="cta" />
        <ScrollReveal delay={0.1}>
          <TrustSection />
        </ScrollReveal>
      </section>

      {/* Last section: you can omit plane or have it run to page bottom */}
<section id="cta" className="relative overflow-visible border-t border-border">
  <ScrollSyncedDividerPlane startId="cta" endId="page-end" />
  <ScrollReveal delay={0.1}>
    <CtaSection />
  </ScrollReveal>
</section>

<div id="page-end" className="h-px" />
    </AppShell>
  );
}
