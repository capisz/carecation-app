import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export async function GET() {
  const { supabase } = await getAuthenticatedUser();
  if (!supabase) {
    return NextResponse.json({ providers: [], persisted: false });
  }

  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .eq("status", "approved")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Failed to load providers.", details: error.message },
      { status: 500 },
    );
  }

  const providers = (data ?? []).map((provider) => {
    const profile = (provider.profile ?? {}) as Record<string, unknown>;
    const rating = Number(profile.rating ?? 4.7);
    const estimateMinUSD = Number(profile.estimateMinUSD ?? 0);
    const estimateMaxUSD = Number(profile.estimateMaxUSD ?? estimateMinUSD);

    return {
      id: provider.id,
      name: provider.name,
      image: String(profile.image ?? "/placeholder.svg"),
      location: `${provider.city}, ${provider.country}`,
      specialty: provider.specialty ?? "Care",
      rating: Number.isFinite(rating) ? rating : 4.7,
      verified: true,
      estimateMinUSD: Number.isFinite(estimateMinUSD) ? estimateMinUSD : 0,
      estimateMaxUSD: Number.isFinite(estimateMaxUSD) ? estimateMaxUSD : 0,
      details: provider.description ?? "Approved Carecation provider.",
    };
  });

  return NextResponse.json({ providers, persisted: true });
}
