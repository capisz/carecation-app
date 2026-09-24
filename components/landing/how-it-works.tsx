const steps = ["Share your needs", "Review your options", "Plan your timeline", "Move forward with confidence"];

export function HowItWorks() {
  return <section className="py-24 lg:py-32" aria-label="How it works">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <h2 className="sr-only">How Carecation works</h2>
      <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4" role="list">
        {steps.map((title, i) => <div key={title} role="listitem">
          <p className="mb-4 text-[15px] font-extrabold text-primary">{String(i + 1).padStart(2, "0")}</p>
          <h3 className="max-w-[15ch] text-[26px] font-bold leading-tight tracking-[-.025em]">{title}</h3>
        </div>)}
      </div>
    </div>
  </section>;
}
