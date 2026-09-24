"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const pages = [["Support", "/support"], ["Privacy", "/privacy"], ["Terms", "/terms"], ["Cookies", "/cookies"], ["Medical disclaimer", "/medical-disclaimer"]] as const;
  return (
    <AppShell>
      <div className="care-page legal-layout">
        <aside className="legal-nav" aria-label="Information pages"><nav>{pages.map(([label, href]) => <Link key={href} href={href} aria-current={pathname===href?"page":undefined} className={pathname===href?"active":""}>{label}</Link>)}</nav></aside>
        <article className="legal-article">
          <header className="legal-article-heading"><h1 className="care-h1">{title}</h1><p className="mt-5 text-xl font-semibold leading-relaxed text-muted-foreground">{intro}</p></header>
          <div className="space-y-9">{sections.map((section) => <section key={section.title} className="legal-section"><h2 className="text-xl font-extrabold">{section.title}</h2><p className="mt-3 text-[17px] leading-[1.65] text-muted-foreground">{section.body}</p></section>)}</div>
        </article>
      </div>
    </AppShell>
  );
}
