"use client";

import { useEffect } from "react";

import { runWhenIdle } from "@/lib/perf/run-when-idle";

// Public DSN (safe to expose in the client bundle by design).
const SENTRY_DSN =
  "https://8fc81c7ba7714593e1e81590960f5274@o4512124723593216.ingest.us.sentry.io/4512124752166916";

let initialized = false;

/**
 * Initialises Sentry error monitoring on the client — loaded on the first
 * interaction (or a few seconds after load) so the SDK stays off the critical
 * path (#27). Errors thrown before the SDK attaches are not reported; an
 * accepted trade-off for the faster first load. Wrapped in try/catch so
 * monitoring setup can never break the app itself.
 */
export function SentryInit() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;

    return runWhenIdle(() => {
      void import("@sentry/browser")
        .then((Sentry) => {
          Sentry.init({
            dsn: SENTRY_DSN,
            environment: process.env.NODE_ENV,
            // Error monitoring only for now (no tracing/replay overhead).
            tracesSampleRate: 0,
          });
        })
        .catch(() => {
          // Never let monitoring setup break the application.
        });
    });
  }, []);

  return null;
}
