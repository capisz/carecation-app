import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="py-28 lg:py-36" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <h2
          id="cta-heading"
          className="care-h2"
        >
          Ready when you are.
        </h2>
        <div className="mt-8 flex justify-center">
          <Link href="/intake" className="care-pill">Start your plan <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
