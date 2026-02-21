import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { BrowseCareContent } from "@/components/browse-care-content";

export default function ClinicsPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-8 text-muted-foreground lg:px-8 lg:py-12">
            Loading care options...
          </div>
        }
      >
        <BrowseCareContent />
      </Suspense>
    </AppShell>
  );
}
