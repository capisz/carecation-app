"use client";

import { Suspense, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { readItineraryPlan, syncItineraryPlanToServer } from "@/lib/itinerary-plan";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

type AuthMode = "signin" | "signup";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/account/plans";
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const migrateDraft = async () => {
    const draft = readItineraryPlan();
    if (draft.flight || draft.hotel || draft.healthcareEstimate || draft.travelRecommendation) {
      await syncItineraryPlanToServer(draft);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Supabase is not configured yet. Add Supabase env vars in Vercel/local env.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
            data: { full_name: fullName },
          },
        });

        if (signUpError) throw signUpError;

        if (!data.session) {
          setMessage("Account created. Check your email to confirm your login.");
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }

      await migrateDraft();
      router.push(redirectTo);
      router.refresh();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="login-layout">
        <div className="login-photo">
          <Link href="/" className="login-brand"><Image src="/brand/carecation-heart-light.png" alt="" width={24} height={24} />Carecation</Link>
          <ThemeToggle className="login-theme-toggle" />
        </div>
        <div className="login-form">
      <div className="login-content">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Save your Carecation plans and return to them later.
          </p>
        </div>

        <Card className="login-card">
          <div className="p-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Name</Label>
                  <Input
                    className="login-input"
                    id="fullName"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    autoComplete="name"
                    placeholder="Jane Doe"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                  <Input
                    className="login-input"
                    id="email"
                    type="email"
                    placeholder="you@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                  <Input
                    className="login-input"
                    id="password"
                    type="password"
                    placeholder="8+ characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  minLength={8}
                  required
                />
              </div>

              {error && (
                <p role="alert" className="text-sm font-bold text-destructive">
                  {error}
                </p>
              )}
              {message && (
                <p role="status" className="text-sm font-semibold text-muted-foreground">
                  {message}
                </p>
              )}

              <Button type="submit" className="h-14 w-full rounded-full text-base font-extrabold" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : mode === "signin" ? (
                  <LogIn className="mr-2 h-4 w-4" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                {mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <div className="mt-5 border-t pt-5 text-sm text-muted-foreground">
              {mode === "signin" ? (
                <button
                  type="button"
                  className="underline underline-offset-4 hover:text-foreground"
                  onClick={() => setMode("signup")}
                >
                  Need an account? Create one
                </button>
              ) : (
                <button
                  type="button"
                  className="underline underline-offset-4 hover:text-foreground"
                  onClick={() => setMode("signin")}
                >
                  Already have an account? Sign in
                </button>
              )}
              <p className="mt-3">
                By continuing, you agree to the{" "}
                <Link href="/terms" className="underline underline-offset-4">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline underline-offset-4">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </Card>
      </div>
      </div></div>
    </AppShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="mx-auto max-w-md px-4 py-12 text-muted-foreground lg:py-16">
            Loading account access...
          </div>
        </AppShell>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
