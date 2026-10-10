"use client";

import { useEffect } from "react";

import { runWhenIdle } from "@/lib/perf/run-when-idle";

/**
 * Microsoft Clarity — free session recordings + heatmaps (where users click,
 * scroll, hesitate, rage-click, and drop off).
 *
 * Env-driven: with no id this renders nothing and loads no script. Set
 * `NEXT_PUBLIC_CLARITY_ID` (clarity.microsoft.com → Settings → project id)
 * to override the default. Clarity masks text content by default, so it stays
 * privacy-friendly. Loaded on the first interaction / a few seconds after load
 * so it never competes with the first paint (#27).
 */
// Clarity project id for عقدي (contractejar.com). Public by design — it
// appears in the page source like any tracking id. An env var overrides it.
const DEFAULT_CLARITY_ID = "yp4isdfowh";

declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
  }
}

export default function ClarityScript() {
  useEffect(() => {
    const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID || DEFAULT_CLARITY_ID;
    if (!clarityId || typeof window === "undefined") return;

    return runWhenIdle(() => {
      if (document.getElementById("ms-clarity")) return;
      window.clarity =
        window.clarity ||
        function (...args: unknown[]) {
          (window.clarity!.q = window.clarity!.q || []).push(args);
        };
      const script = document.createElement("script");
      script.id = "ms-clarity";
      script.async = true;
      script.src = `https://www.clarity.ms/tag/${clarityId}`;
      document.head.appendChild(script);
    });
  }, []);

  return null;
}
