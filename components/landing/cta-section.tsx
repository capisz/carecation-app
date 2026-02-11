import { SmartLink } from "@/components/smart-link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-20 lg:py-28 bg-secondary border-t" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 text-center">
        <h2
          id="cta-heading"
          className="text-3xl font-bold text-foreground sm:text-4xl text-balance"
        >
          Ready to explore your options?
        </h2>
        <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
          Start researching accredited providers, understand the costs, and build
          a carecation plan tailored to your needs. There is no commitment
          required to get started.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg" className="text-base">
            <SmartLink href="/intake">
              Begin your care plan
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </SmartLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
