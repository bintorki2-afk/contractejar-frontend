"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import * as Sentry from "@sentry/browser";
import { useTranslations } from "next-intl";

/**
 * Route-level error boundary. Catches render/runtime errors in pages below the
 * root layout and shows a branded, bilingual recovery screen inside the site's
 * theme/font. Reports to Sentry and surfaces a short reference the customer can
 * quote to support. Root-layout crashes are handled by global-error.tsx.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorPage");
  const tNav = useTranslations("navbar");
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
    <main className="relative flex min-h-[100svh] items-center justify-center px-5 py-16">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute start-1/2 top-1/3 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/5 blur-3xl dark:bg-brand/15" />
      </div>

      <section className="relative w-full max-w-lg rounded-3xl border border-border bg-card/85 px-6 py-10 text-center shadow-sm backdrop-blur-sm sm:px-12 sm:py-14">
        <Link
          href="/"
          aria-label={tNav("brand.name")}
          className="mx-auto mb-6 flex w-full flex-col items-center justify-center gap-3"
        >
          <span className="flex size-20 items-center justify-center rounded-2xl bg-brand-background-green ring-1 ring-brand/10">
            <Image
              src="/images/logo.png"
              alt=""
              width={120}
              height={184}
              className="h-11 w-auto object-contain"
              aria-hidden
            />
          </span>
          <span className="text-base font-bold text-brand">
            {tNav("brand.name")}
          </span>
        </Link>

        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {t("badge")}
        </div>

        <h1 className="text-2xl font-bold text-foreground sm:text-[1.75rem]">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">
          {t("description")}
        </p>

        {reference ? (
          <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2.5 text-sm text-foreground">
            {t("reference")}:{" "}
            <strong className="font-mono tracking-widest">{reference}</strong>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand/90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {t("retry")}
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            {t("homeCta")}
          </Link>
        </div>
      </section>
    </main>
  );
}
