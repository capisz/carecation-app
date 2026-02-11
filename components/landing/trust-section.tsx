import { ShieldCheck, Clock, Headphones, CreditCard } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified accreditations",
    description:
      "Every provider listed holds recognized credentials such as JCI, ISAPS, or ADA certifications. We encourage you to verify these independently as well.",
  },
  {
    icon: Clock,
    title: "Recovery-aware planning",
    description:
      "Itineraries are built with recovery time in mind, helping ensure you have adequate rest before any sightseeing or return travel.",
  },
  {
    icon: Headphones,
    title: "Multilingual support",
    description:
      "Filter providers by the languages their teams speak. Many clinics also offer dedicated interpreters for your comfort.",
  },
  {
    icon: CreditCard,
    title: "Clear cost information",
    description:
      "See provider-reported price ranges upfront alongside estimated total trip costs. No hidden figures or pressure to commit.",
  },
];

export function TrustSection() {
  return (
    <section className="py-20 lg:py-28" aria-labelledby="trust-heading">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-14">
          <h2
            id="trust-heading"
            className="text-3xl font-bold text-foreground sm:text-4xl text-balance"
          >
            Built around clarity and care
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            We believe informed decisions start with honest, accessible
            information at every step.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {features.map((feature) => (
            <div key={feature.title} className="text-center" role="listitem">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
