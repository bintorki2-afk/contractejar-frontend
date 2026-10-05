"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/browser";
import { useTranslations } from "next-intl";

/**
 * Route-level error boundary. Catches render/runtime errors in pages below the
 * root layout and shows a branded, bilingual recovery screen (inside the site's
 * theme/font) instead of a bare crash. Reports to Sentry and surfaces a short
 * reference the customer can quote to support. Root-layout crashes are handled
 * separately by global-error.tsx.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorPage");
  const [reference, setReference] = useState("");

  useEffect(() => {
    let id = "";
    try {
      id = Sentry.captureException(error) || "";
    } catch {
      // ignore
    }
    const raw = id || error.digest || "";
    setReference(raw ? raw.slice(0, 8).toUpperCase() : "");
  }, [error]);

  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          {t("description")}
        </p>

        {reference ? (
          <div className="mt-5 rounded-lg bg-muted px-4 py-2.5 text-sm text-foreground">
            {t("reference")}:{" "}
            <strong className="tracking-widest">{reference}</strong>
          </div>
        ) : null}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-brand px-6 text-sm font-medium text-white transition-colors hover:bg-brand/90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {t("retry")}
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {t("homeCta")}
          </Link>
        </div>
      </div>
    </main>
  );
}
