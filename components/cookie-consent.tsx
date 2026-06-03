"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const COOKIE_NAME = "carecation_cookie_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

type ConsentValue = "essential" | "all";

function getConsent(): ConsentValue | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${COOKIE_NAME}=`));
  return (match?.split("=")[1] as ConsentValue | undefined) ?? null;
}

function setConsent(value: ConsentValue) {
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("carecation-cookie-consent", { detail: value }));
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!getConsent());
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[120] border-t border-border bg-card/95 px-4 py-4 shadow-lg backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-3xl text-sm text-muted-foreground">
          Carecation uses required cookies for login and saved plans. Optional cookies may
          help measure usage and affiliate handoffs. Review our{" "}
          <Link href="/cookies" className="text-foreground underline underline-offset-4">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setConsent("essential");
              setVisible(false);
            }}
          >
            Essential only
          </Button>
          <Button
            type="button"
            onClick={() => {
              setConsent("all");
              setVisible(false);
            }}
          >
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
