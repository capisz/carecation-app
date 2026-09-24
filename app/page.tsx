import { AppShell } from "@/components/app-shell";
import { FlagParallaxBackground } from "@/components/landing/flag-parallax-background";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { HeroSection } from "@/components/landing/hero-section";
import { DestinationsSection } from "@/components/landing/destinations-section";
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

      <section id="destinations" className="relative overflow-visible border-t border-border" style={{ position: 'relative' }}>
        <ScrollSyncedDividerPlane startId="hero" endId="destinations" />
        <ScrollReveal delay={0.1}>
          <DestinationsSection />
        </ScrollReveal>
      </section>

      <section id="cta" className="relative overflow-visible border-t border-border" style={{ position: 'relative' }}>
        <ScrollSyncedDividerPlane startId="destinations" endId="cta" />
        <ScrollReveal delay={0.1}>
          <CtaSection />
        </ScrollReveal>
      </section>
    </AppShell>
  );
}
