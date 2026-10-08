"use client";

import {
  CheckCircle2,
  CircleAlert,
  CircleHelp,
  CircleX,
  CreditCard,
  Database,
  Clock,
  RefreshCw,
  Server,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { getPlatformStatus } from "@/features/platform-status/services/get-platform-status";
import {
  OVERALL_COPY,
  STATE_COPY,
  type ComponentState,
  type PlatformComponentKey,
  type PlatformStatus,
} from "@/features/platform-status/utils/normalize-platform-status";
import { cn } from "@/lib/utils";

const REFRESH_MS = 60_000;

const COMPONENT_ICONS: Record<PlatformComponentKey, typeof Server> = {
  api: Server,
  database: Database,
  scheduler: Clock,
  gateway: CreditCard,
};

const STATE_STYLES: Record<ComponentState, { pill: string; icon: typeof CheckCircle2; banner: string }> = {
  ok: {
    pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    icon: CheckCircle2,
    banner: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200",
  },
  degraded: {
    pill: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    icon: CircleAlert,
    banner: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200",
  },
  down: {
    pill: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    icon: CircleX,
    banner: "border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200",
  },
  unknown: {
    pill: "bg-muted text-muted-foreground",
    icon: CircleHelp,
    banner: "border-border bg-muted/40 text-foreground",
  },
};

function formatTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Riyadh",
  }).format(date);
}

export default function PlatformStatusBoard({ initial }: { initial: PlatformStatus }) {
  const [status, setStatus] = useState<PlatformStatus>(initial);
  const [refreshing, setRefreshing] = useState(false);
  // Client clock for «آخر تحديث» (server-rendered time would mismatch on hydration).
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRefreshing(true);
    try {
      setStatus(await getPlatformStatus());
      setFetchedAt(new Date().toISOString());
    } catch {
      // Keep the last known state; the next tick retries.
    } finally {
      inFlight.current = false;
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setFetchedAt(new Date().toISOString());
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const overallStyle = STATE_STYLES[status.overall];
  const OverallIcon = overallStyle.icon;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <div
        role="status"
        aria-live="polite"
        className={cn("flex items-center gap-3 rounded-3xl border p-5", overallStyle.banner)}
      >
        <OverallIcon className="size-7 shrink-0" aria-hidden="true" />
        <p className="text-base font-extrabold md:text-lg">{OVERALL_COPY[status.overall]}</p>
      </div>

      <ul className="divide-y overflow-hidden rounded-3xl border bg-white shadow-sm dark:divide-[#2f403b] dark:border-[#2f403b] dark:bg-[#1a2421]">
        {status.components.map((component) => {
          const Icon = COMPONENT_ICONS[component.key];
          const style = STATE_STYLES[component.state];
          const StateIcon = style.icon;
          return (
            <li key={component.key} className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-background-green text-brand">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">{component.label}</p>
                  <p className="text-xs text-muted-foreground">{component.description}</p>
                </div>
              </div>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
                  style.pill,
                )}
              >
                <StateIcon className="size-3.5" aria-hidden="true" />
                {STATE_COPY[component.state]}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>
          آخر فحص: <span dir="ltr">{formatTime(status.checkedAt ?? fetchedAt)}</span> · تتحدّث الصفحة تلقائياً كل دقيقة
        </p>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={refreshing}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 font-bold text-brand transition hover:bg-brand-background-green disabled:opacity-60"
        >
          <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} aria-hidden="true" />
          تحديث الآن
        </button>
      </div>
    </div>
  );
}
