"use client";

import type { ReactNode } from "react";
import { Check, Lock } from "lucide-react";

import { cn } from "@/lib/utils";

export type StageCardState = "active" | "complete" | "locked";

type CreateContractStageCardProps = {
  /** 1-based stage number shown in the badge (replaced by a check when complete). */
  index: number;
  title: string;
  subtitle?: string;
  state: StageCardState;
  completeLabel?: string;
  /** Shown instead of the subtitle while the stage is locked. */
  lockedLabel?: string;
  children: ReactNode;
};

/**
 * A "stage" within a wizard step. Stages never fold: the deed stage is always
 * open for editing, and the national-address stage stays greyed out (locked)
 * until the deed stage is complete, then opens in place.
 */
export default function CreateContractStageCard({
  index,
  title,
  subtitle,
  state,
  completeLabel = "مكتمل",
  lockedLabel,
  children,
}: CreateContractStageCardProps) {
  const isLocked = state === "locked";
  const isComplete = state === "complete";

  return (
    <section
      dir="rtl"
      data-state={state}
      className={cn(
        "rounded-[22px] border transition-all duration-300",
        isLocked
          ? "border-[#e8e8e8] bg-[#fafafa] opacity-70 dark:border-[#2f403b] dark:bg-[#161f1c]"
          : "border-brand-secondary/40 bg-white shadow-[0_8px_30px_-12px_rgba(0,168,128,0.3)] dark:border-brand-secondary/30 dark:bg-[#121a18]",
      )}
    >
      <header className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold transition-all duration-300",
            isComplete
              ? "bg-brand-secondary text-white shadow-[0_0_0_4px_rgba(0,168,128,0.15)]"
              : isLocked
                ? "bg-[#eef0ef] text-[#b4b9b7] dark:bg-[#24302c] dark:text-[#6a7a74]"
                : "bg-brand text-white shadow-[0_0_0_4px_rgba(0,168,128,0.15)] dark:bg-brand-secondary",
          )}
        >
          {isComplete ? (
            <Check className="size-5" aria-hidden />
          ) : isLocked ? (
            <Lock className="size-4" aria-hidden />
          ) : (
            index
          )}
        </span>

        <span className="min-w-0 flex-1 space-y-0.5">
          <span className="flex items-center gap-2">
            <span
              className={cn(
                "block truncate text-base font-extrabold",
                isLocked
                  ? "text-[#9a9a9a] dark:text-[#6a7a74]"
                  : "text-brand dark:text-white",
              )}
            >
              {title}
            </span>
            {isComplete ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-secondary/12 px-2 py-0.5 text-[11px] font-bold text-brand dark:bg-brand-secondary/20 dark:text-[#8ff0d3]">
                <Check className="size-3" aria-hidden />
                {completeLabel}
              </span>
            ) : null}
          </span>

          {subtitle ? (
            <span className="block truncate text-xs text-[#9a9a9a] dark:text-[#8b9d97]">
              {isLocked && lockedLabel ? lockedLabel : subtitle}
            </span>
          ) : null}
        </span>
      </header>

      {/* A locked stage shows only its greyed header; the body opens in place
          as soon as the previous stage is complete (no folding, ever). */}
      {isLocked ? null : (
        <div className="border-t border-[#f0f0f0] px-4 py-4 sm:px-5 dark:border-[#2f403b]">
          {children}
        </div>
      )}
    </section>
  );
}
