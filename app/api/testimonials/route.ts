import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/supabase/server";

type TestimonialBody = {
  institution?: string;
  rating?: number;
  review?: string;
  reviewerName?: string | null;
  anonymous?: boolean;
};

export async function GET() {
  const { supabase } = await getAuthenticatedUser();
  if (!supabase) {
    return NextResponse.json({ testimonials: [], persisted: false });
  }

  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    return jsonError("Failed to load testimonials.", 500, error.message);
  }

  return NextResponse.json({ testimonials: data ?? [], persisted: true });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as TestimonialBody;
  const institution = body.institution?.trim();
  const review = body.review?.trim();
  const rating = Number(body.rating);

  if (!institution || !review || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return jsonError("institution, review, and a 1-5 rating are required.", 400);
  }

  const { supabase, user } = await getAuthenticatedUser();
  if (!supabase) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { data, error } = await supabase
    .from("testimonials")
    .insert({
      user_id: user?.id ?? null,
      institution,
      rating,
      review,
      reviewer_name: body.anonymous ? null : body.reviewerName ?? null,
      anonymous: Boolean(body.anonymous),
      status: "approved",
    })
    .select("*")
    .single();

  if (error) {
    return jsonError("Failed to submit testimonial.", 500, error.message);
  }

  return NextResponse.json({ testimonial: data, persisted: true }, { status: 201 });
}
