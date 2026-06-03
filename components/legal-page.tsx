import { AppShell } from "@/components/app-shell";

type LegalPageProps = {
  title: string;
  intro: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
};

export function LegalPage({ title, intro, sections }: LegalPageProps) {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8 lg:py-14">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
          <p className="mt-3 text-muted-foreground">{intro}</p>
        </div>
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
              <p className="mt-2 leading-7 text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
