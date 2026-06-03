"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  buildPlanTitle,
  loadItineraryPlan,
  readItineraryPlan,
  syncItineraryPlanToServer,
} from "@/lib/itinerary-plan";
import type { ItineraryPlan } from "@/lib/itinerary-types";
import { Edit3, Loader2, Plus, Trash2 } from "lucide-react";

type SavedPlan = {
  id: string;
  title: string;
  status: "active" | "archived";
  plan_snapshot: ItineraryPlan;
  updated_at: string;
  created_at: string;
};

export default function AccountPlansPage() {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState("");

  const loadPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/plans");
      const data = await response.json().catch(() => null);
      if (response.status === 401) {
        setError("Sign in to view and save your plans.");
        setPlans([]);
        return;
      }
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to load plans.");
      }
      setPlans(data.plans ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load plans.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPlans();
  }, []);

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setError(null);
    try {
      const result = await syncItineraryPlanToServer(readItineraryPlan());
      if (!result.ok) {
        const draft = readItineraryPlan();
        const response = await fetch("/api/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: buildPlanTitle(draft),
            plan: draft,
          }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error ?? "Failed to save draft.");
        }
      }
      await loadPlans();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save draft.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleLoadPlan = (plan: SavedPlan) => {
    loadItineraryPlan(plan.plan_snapshot ?? {}, plan.id);
    window.location.href = "/itinerary";
  };

  const handleRename = async (plan: SavedPlan) => {
    const title = titleDraft.trim();
    if (!title) return;

    const response = await fetch(`/api/plans/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (response.ok) {
      setEditingId(null);
      setTitleDraft("");
      await loadPlans();
    }
  };

  const handleDelete = async (plan: SavedPlan) => {
    const response = await fetch(`/api/plans/${plan.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      await loadPlans();
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8 lg:py-14">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              Saved plans
            </h1>
            <p className="mt-2 text-muted-foreground">
              Return to a Carecation plan, change selections, or save your current draft.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSaveDraft} disabled={isSavingDraft}>
              {isSavingDraft ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Save current draft
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/logout">Sign out</Link>
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            {error}{" "}
            {error.includes("Sign in") && (
              <Link href="/login" className="font-medium text-primary underline underline-offset-4">
                Sign in
              </Link>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            Loading saved plans...
          </div>
        ) : plans.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                No saved plans yet. Build a plan through Browse Travel and Browse Care, then save it here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {plans.map((plan) => {
              const isEditing = editingId === plan.id;
              return (
                <Card key={plan.id}>
                  <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <div className="flex max-w-md gap-2">
                          <Input
                            value={titleDraft}
                            onChange={(event) => setTitleDraft(event.target.value)}
                            aria-label="Plan title"
                          />
                          <Button type="button" onClick={() => handleRename(plan)}>
                            Save
                          </Button>
                        </div>
                      ) : (
                        <>
                          <h2 className="truncate text-lg font-semibold text-foreground">
                            {plan.title}
                          </h2>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Updated {new Date(plan.updated_at).toLocaleString()}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" onClick={() => handleLoadPlan(plan)}>
                        View itinerary
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingId(plan.id);
                          setTitleDraft(plan.title);
                        }}
                        aria-label={`Rename ${plan.title}`}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleDelete(plan)}
                        aria-label={`Delete ${plan.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
