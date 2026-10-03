"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  FolderOpen,
  Zap,
} from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resetCreatePropertyDraft } from "@/features/create-property/utils/reset-create-property-draft";
import type {
  MyPropertiesHowItWorksStep,
  MyPropertiesLabels,
} from "@/features/my-properties/types/my-properties-labels";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "aqdi-properties-onboarding-dismissed";

const SLIDE_ICONS: ComponentType<{ className?: string }>[] = [
  Building2,
  Zap,
  FolderOpen,
];

type MyPropertiesOnboardingDialogProps = {
  steps: MyPropertiesHowItWorksStep[];
  labels: MyPropertiesLabels["onboarding"];
};

/**
 * A one-time welcome walkthrough for customers who have no properties yet:
 * interactive slides they step through, with a "don't show again" opt-out that
 * is remembered in localStorage. Auto-opens on first visit while the list is
 * empty; stays closed once dismissed.
 */
export default function MyPropertiesOnboardingDialog({
  steps,
  labels,
}: MyPropertiesOnboardingDialogProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== "1") {
        setOpen(true);
      }
    } catch {
      // localStorage may be unavailable (private mode) — just skip auto-open.
    }
  }, []);

  function persistDismissal(dismiss: boolean) {
    if (!dismiss) {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore storage failures
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      persistDismissal(dontShowAgain);
    }
    setOpen(next);
  }

  if (!steps?.length) {
    return null;
  }

  const total = steps.length;
  const isLast = index === total - 1;
  const current = steps[index];
  const Icon = SLIDE_ICONS[index] ?? Building2;
  const progress = labels.progressTemplate
    .replace("{current}", String(index + 1))
    .replace("{total}", String(total));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-[1.75rem] p-0 sm:max-w-md dark:bg-[#151c1b]">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-black/5 px-6 py-4 dark:border-white/10">
          <DialogTitle className="text-base font-extrabold text-brand dark:text-white">
            {labels.title}
          </DialogTitle>
          <span className="me-6 text-xs font-bold text-[#9a9a9a] dark:text-white/40">
            {progress}
          </span>
        </DialogHeader>

        <div className="px-6 pt-8 pb-6 text-center">
          <div
            key={index}
            className="flex flex-col items-center gap-4 duration-300 animate-in fade-in-0 slide-in-from-bottom-2"
          >
            <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-background-green text-brand dark:bg-[#16352f] dark:text-[#48c0b8]">
              <Icon className="size-8" />
            </span>
            <h3 className="text-lg font-extrabold text-foreground">
              {current.title}
            </h3>
            <p className="mx-auto max-w-xs text-sm leading-7 text-[#5b5b5b] dark:text-white/65">
              {current.description}
            </p>
          </div>

          {/* step dots */}
          <div className="mt-7 flex items-center justify-center gap-2">
            {steps.map((step, dotIndex) => (
              <button
                key={step.title}
                type="button"
                aria-label={step.title}
                onClick={() => setIndex(dotIndex)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  dotIndex === index
                    ? "w-6 bg-brand dark:bg-[#48c0b8]"
                    : "w-2 bg-brand/20 hover:bg-brand/40 dark:bg-white/15",
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-black/5 px-6 py-4 dark:border-white/10">
          <button
            type="button"
            onClick={() => setDontShowAgain((value) => !value)}
            className="flex items-center gap-2 text-xs font-semibold text-[#7a7a7a] transition-colors hover:text-brand dark:text-white/50"
          >
            <span
              className={cn(
                "flex size-4 items-center justify-center rounded-[5px] border transition-colors",
                dontShowAgain
                  ? "border-brand bg-brand text-white dark:border-[#48c0b8] dark:bg-[#48c0b8]"
                  : "border-[#cfcfcf] dark:border-white/30",
              )}
            >
              {dontShowAgain ? <Check className="size-3" aria-hidden="true" /> : null}
            </span>
            {labels.dontShowAgain}
          </button>

          <div className="flex items-center gap-2">
            {index > 0 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIndex((value) => Math.max(0, value - 1))}
                className="h-11 gap-1 rounded-2xl px-3 text-sm font-bold text-brand hover:bg-brand-background-green dark:text-[#48c0b8] dark:hover:bg-[#16352f]"
              >
                <ArrowRight className="size-4" aria-hidden="true" />
                {labels.back}
              </Button>
            ) : null}

            {isLast ? (
              <Button
                type="button"
                className="h-11 gap-2 rounded-2xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand/90"
                asChild
              >
                <Link
                  href="/properties/create"
                  onClick={() => {
                    persistDismissal(dontShowAgain);
                    resetCreatePropertyDraft();
                  }}
                >
                  <Building2 className="size-4" aria-hidden="true" />
                  {labels.start}
                </Link>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => setIndex((value) => Math.min(total - 1, value + 1))}
                className="h-11 gap-1 rounded-2xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand/90"
              >
                {labels.next}
                <ArrowLeft className="size-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
