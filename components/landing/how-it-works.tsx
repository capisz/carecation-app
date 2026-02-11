import { ClipboardList, Search, CalendarDays, Plane } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Share your needs",
    description:
      "Tell us about the procedure you are considering, your budget, and any travel preferences.",
  },
  {
    icon: Search,
    title: "Review your options",
    description:
      "Browse accredited providers filtered to match your criteria. Compare credentials, pricing, and patient reviews.",
  },
  {
    icon: CalendarDays,
    title: "Plan your timeline",
    description:
      "See a suggested day-by-day itinerary covering consultation, treatment, recovery, and leisure time.",
  },
  {
    icon: Plane,
    title: "Move forward with confidence",
    description:
      "Request a detailed quote from the provider and take the next step when you are ready.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 lg:py-28" aria-labelledby="how-heading">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-14">
          <h2
            id="how-heading"
            className="text-3xl font-bold text-foreground sm:text-4xl text-balance"
          >
            How Carecation works
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            A clear, step-by-step process to help you research and prepare for
            medical care abroad.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center" role="listitem">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-5">
                <step.icon className="h-7 w-7 text-primary" aria-hidden="true" />
              </div>
              <div
                className="absolute -top-2 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold"
                aria-hidden="true"
              >
                {i + 1}
              </div>
              <h3 className="font-semibold text-foreground text-lg mb-2">
                <span className="sr-only">Step {i + 1}: </span>
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
