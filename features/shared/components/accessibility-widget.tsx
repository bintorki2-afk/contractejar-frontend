"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Accessibility,
  Contrast,
  Link2,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

const KEY = "cj-a11y";

type Settings = {
  font: 0 | 1 | 2;
  contrast: boolean;
  links: boolean;
  motion: boolean;
};

const DEFAULTS: Settings = {
  font: 0,
  contrast: false,
  links: false,
  motion: false,
};

function apply(s: Settings) {
  const h = document.documentElement;
  h.classList.toggle("a11y-font-1", s.font === 1);
  h.classList.toggle("a11y-font-2", s.font === 2);
  h.classList.toggle("a11y-contrast", s.contrast);
  h.classList.toggle("a11y-links", s.links);
  h.classList.toggle("a11y-motion", s.motion);
}

export default function AccessibilityWidget() {
  const t = useTranslations("a11y");
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    let parsed: Settings = DEFAULTS;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) parsed = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
    } catch {
      /* ignore */
    }
    apply(parsed);
    const id = requestAnimationFrame(() => setSettings(parsed));
    return () => cancelAnimationFrame(id);
  }, []);

  function update(next: Settings) {
    setSettings(next);
    apply(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  const active =
    settings.font !== 0 ||
    settings.contrast ||
    settings.links ||
    settings.motion;

  const toggles: { key: "contrast" | "links" | "motion"; label: string; icon: React.ReactNode }[] =
    [
      { key: "contrast", label: t("contrast"), icon: <Contrast className="size-4" aria-hidden="true" /> },
      { key: "links", label: t("links"), icon: <Link2 className="size-4" aria-hidden="true" /> },
      { key: "motion", label: t("motion"), icon: <Sparkles className="size-4" aria-hidden="true" /> },
    ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("open")}
        aria-expanded={open}
        className={cn(
          "fixed bottom-6 start-6 z-[65] flex size-12 items-center justify-center rounded-full border border-white/20 bg-brand text-white shadow-lg transition hover:scale-105",
          active && "ring-2 ring-brand-secondary ring-offset-2 ring-offset-transparent",
        )}
      >
        <Accessibility className="size-6" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={t("title")}
          className="fixed bottom-24 start-6 z-[66] w-72 max-w-[calc(100vw-2rem)] rounded-3xl border border-black/10 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#0f1a17]"
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-extrabold text-foreground">{t("title")}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("close")}
              className="rounded-full p-1 text-muted-foreground transition hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          {/* Font size */}
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-border/60 p-2.5">
            <span className="ps-1 text-sm font-semibold text-foreground">
              {t("fontSize")}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  update({ ...settings, font: Math.max(0, settings.font - 1) as 0 | 1 | 2 })
                }
                aria-label={t("decrease")}
                className="flex size-8 items-center justify-center rounded-full border border-border/60 text-brand transition hover:bg-brand-background"
              >
                <Minus className="size-4" aria-hidden="true" />
              </button>
              <span className="w-5 text-center text-sm font-bold text-brand">
                {settings.font + 1}
              </span>
              <button
                type="button"
                onClick={() =>
                  update({ ...settings, font: Math.min(2, settings.font + 1) as 0 | 1 | 2 })
                }
                aria-label={t("increase")}
                className="flex size-8 items-center justify-center rounded-full border border-border/60 text-brand transition hover:bg-brand-background"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            {toggles.map((tg) => {
              const on = settings[tg.key];
              return (
                <button
                  key={tg.key}
                  type="button"
                  onClick={() => update({ ...settings, [tg.key]: !on })}
                  aria-pressed={on}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-sm font-semibold transition-colors",
                    on
                      ? "border-brand bg-brand-background text-brand"
                      : "border-border/60 text-foreground hover:bg-black/[0.03] dark:hover:bg-white/[0.04]",
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    {tg.icon}
                    {tg.label}
                  </span>
                  <span
                    className={cn(
                      "relative h-5 w-9 rounded-full transition-colors",
                      on ? "bg-brand" : "bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 size-4 rounded-full bg-white transition-all",
                        on ? "start-4" : "start-0.5",
                      )}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          {active ? (
            <button
              type="button"
              onClick={() => update(DEFAULTS)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/60 py-2.5 text-sm font-bold text-muted-foreground transition hover:text-brand"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              {t("reset")}
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
