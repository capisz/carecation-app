"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { getAllProviders } from "@/lib/data/providers-repo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

type TestimonialForm = {
  institution: string;
  rating: number;
  review: string;
  reviewerName: string;
  anonymous: boolean;
};

const initialForm: TestimonialForm = {
  institution: "",
  rating: 0,
  review: "",
  reviewerName: "",
  anonymous: false,
};

type ExistingTestimonial = {
  id: string;
  institution: string;
  rating: number;
  review: string;
  reviewerLabel: string;
  submittedAt: string;
};

const INITIAL_TESTIMONIALS: ExistingTestimonial[] = [
  {
    id: "t1",
    institution: "Bangkok Smile Dental Center",
    rating: 5,
    review:
      "The team explained every step clearly and the follow-up was excellent. I felt supported before and after treatment.",
    reviewerLabel: "Maya R.",
    submittedAt: "Jan 14, 2026",
  },
  {
    id: "t2",
    institution: "Istanbul Aesthetic Clinic",
    rating: 4,
    review:
      "Strong communication and smooth scheduling. Recovery support was helpful, and the clinic staff stayed responsive throughout.",
    reviewerLabel: "Anonymous",
    submittedAt: "Dec 21, 2025",
  },
  {
    id: "t3",
    institution: "Mexico City Heart Institute",
    rating: 5,
    review:
      "Very organized process from intake to discharge. Coordinators were clear about costs and timelines with no surprises.",
    reviewerLabel: "Daniel K.",
    submittedAt: "Nov 3, 2025",
  },
];

export default function TestimonialsPage() {
  const providerNames = useMemo(
    () =>
      Array.from(new Set(getAllProviders().map((provider) => provider.name))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [],
  );

  const [form, setForm] = useState<TestimonialForm>(initialForm);
  const [ratingTouched, setRatingTouched] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [testimonials, setTestimonials] = useState<ExistingTestimonial[]>(
    INITIAL_TESTIMONIALS,
  );
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const update = <K extends keyof TestimonialForm>(
    key: K,
    value: TestimonialForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRatingTouched(true);

    if (form.rating < 1 || form.rating > 5) {
      return;
    }

    const payload = {
      institution: form.institution.trim(),
      rating: form.rating,
      review: form.review.trim(),
      anonymous: form.anonymous,
      reviewerName: form.anonymous ? null : form.reviewerName.trim(),
    };

    console.log("Testimonial submission payload:", payload);

    const reviewerLabel = payload.anonymous
      ? "Anonymous"
      : payload.reviewerName || "Anonymous";

    setTestimonials((prev) => [
      {
        id: `${Date.now()}`,
        institution: payload.institution,
        rating: payload.rating,
        review: payload.review,
        reviewerLabel,
        submittedAt: new Date().toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      },
      ...prev,
    ]);
    setSubmitMessage(
      `Thanks for sharing your review for ${payload.institution}. It is now listed in testimonials.`,
    );
    setShowForm(false);
    setForm(initialForm);
    setRatingTouched(false);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8 lg:py-14">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              Testimonials
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Read existing reviews or submit your own testimonial for a clinic or healthcare institution.
            </p>
          </div>
          <Button
            variant={showForm ? "outline" : "default"}
            onClick={() => {
              setShowForm((prev) => !prev);
              setSubmitMessage(null);
              window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
            }}
          >
            {showForm ? "View testimonials" : "Leave a testimonial"}
          </Button>
        </div>

        {submitMessage && (
          <div className="mb-6 rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
            {submitMessage}
          </div>
        )}

        {showForm ? (
          <Card>
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="institution">Clinic or healthcare institution *</Label>
                  <Input
                    id="institution"
                    required
                    list="clinic-options"
                    value={form.institution}
                    onChange={(e) => update("institution", e.target.value)}
                    placeholder="e.g., Bangkok Smile Dental Center"
                  />
                  <datalist id="clinic-options">
                    {providerNames.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <Label>Overall rating *</Label>
                  <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Overall rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={form.rating === star}
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                        onClick={() => {
                          update("rating", star);
                          setRatingTouched(true);
                        }}
                        className="rounded-md p-1.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Star
                          className={cn(
                            "h-6 w-6",
                            star <= form.rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground",
                          )}
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                    <span className="ml-1 text-sm text-muted-foreground">
                      {form.rating > 0 ? `${form.rating} out of 5` : "Select a rating"}
                    </span>
                  </div>
                  {ratingTouched && form.rating === 0 && (
                    <p className="text-sm text-destructive">Please select a rating.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review">Your review *</Label>
                  <Textarea
                    id="review"
                    required
                    rows={5}
                    minLength={20}
                    value={form.review}
                    onChange={(e) => update("review", e.target.value)}
                    placeholder="Share your experience, quality of care, communication, and recovery support..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Display preference *</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                      <input
                        type="radio"
                        name="displayPreference"
                        checked={!form.anonymous}
                        onChange={() => update("anonymous", false)}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="text-sm text-foreground">Show my name</span>
                    </label>
                    <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                      <input
                        type="radio"
                        name="displayPreference"
                        checked={form.anonymous}
                        onChange={() => update("anonymous", true)}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="text-sm text-foreground">Post anonymously</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reviewerName">
                    Your name {form.anonymous ? "(optional)" : "*"}
                  </Label>
                  <Input
                    id="reviewerName"
                    value={form.reviewerName}
                    required={!form.anonymous}
                    disabled={form.anonymous}
                    onChange={(e) => update("reviewerName", e.target.value)}
                    placeholder={form.anonymous ? "Anonymous submission selected" : "Jane Doe"}
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button type="submit" className="w-full sm:w-auto">
                    Submit testimonial
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setSubmitMessage(null);
                      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                    }}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="space-y-4">
                {testimonials.map((testimonial) => (
                  <article
                    key={testimonial.id}
                    className="rounded-lg border border-border bg-background p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-base font-semibold text-foreground">
                        {testimonial.institution}
                      </h2>
                      <div
                        className="flex items-center gap-1"
                        aria-label={`${testimonial.rating} out of 5 stars`}
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={`${testimonial.id}-star-${star}`}
                            className={cn(
                              "h-4 w-4",
                              star <= testimonial.rating
                                ? "fill-primary text-primary"
                                : "text-muted-foreground",
                            )}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {testimonial.review}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {testimonial.reviewerLabel} · {testimonial.submittedAt}
                    </p>
                  </article>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
