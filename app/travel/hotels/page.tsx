import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { HotelsPanel } from "@/components/travel/hotels-panel";

export default function HotelsPage() {
  return (
    <Suspense fallback={<AppShell><div className="py-20 text-center text-muted-foreground">Loading hotel options...</div></AppShell>}>
      <AppShell><HotelsPanel /></AppShell>
    </Suspense>
  );
}
