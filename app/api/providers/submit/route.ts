import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/supabase/server";

/**
 * POST /api/providers/submit
 * 
 * Accepts provider intake form submissions.
 * Currently logs to console; in production would save to database.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      "clinicName",
      "providerType",
      "contactName",
      "email",
      "phone",
      "country",
      "city",
      "specialties",
      "languages",
      "consultationType",
      "priceRange",
      "accredited",
      "termsConsent"
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    const { supabase, user } = await getAuthenticatedUser();
    let submissionId = `PROV-${Date.now()}`;

    if (supabase) {
      const { data, error } = await supabase
        .from("provider_applications")
        .insert({
          submitted_by: user?.id ?? null,
          clinic_name: body.clinicName,
          provider_type: body.providerType,
          contact_name: body.contactName,
          email: body.email,
          phone: body.phone,
          country: body.country,
          city: body.city,
          payload: body,
        })
        .select("id")
        .single();

      if (error) {
        return jsonError("Failed to save provider application.", 500, error.message);
      }

      submissionId = data.id;
    } else {
      console.log("[Provider Submission]", {
        timestamp: new Date().toISOString(),
        clinic: body.clinicName,
        type: body.providerType,
        location: `${body.city}, ${body.country}`,
        contact: body.email,
      });
    }
    
    return NextResponse.json(
      {
        success: true,
        message: "Provider application submitted successfully",
        submissionId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Provider Submission Error]", error);
    return jsonError("Failed to process submission.", 500);
  }
}
