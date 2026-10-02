"use client";

import type { ReactNode } from "react";
import { Check, ChevronDown, Lock, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";

export type StageAccordionState = "active" | "complete" | "locked";

type CreateContractStageAccordionProps = {
  /** 1-based stage number shown in the badge (replaced by a check when complete). */
  index: number;
  title: string;
  subtitle?: string;
  state: StageAccordionState;
  open: boolean;
  onToggle: () => void;
  /** Compact recap shown under the title while the stage is collapsed & complete. */
  summary?: ReactNode;
  editLabel?: string;
  completeLabel?: string;
  lockedLabel?: string;
  children: ReactNode;
};

/**
 * A progressive "stage" within a wizard step. One stage is open (active) at a
 * time; completed stages fold up to a compact summary with an edit affordance,
 * and not-yet-reachable stages are locked. The open/close height change is
 * animated with the CSS grid 0fr→1fr technique for a smooth professional fold.
 */
export default function CreateContractStageAccordion({
  index,
  title,
  subtitle,
  state,
  open,
  onToggle,
  summary,
  editLabel = "تعديل",
  completeLabel = "مكتمل",
  lockedLabel,
  children,
}: CreateContractStageAccordionProps) {
  const isLocked = state === "locked";
  const isComplete = state === "complete";
  const clickable = !isLocked;

  return (
    <div
      dir="rtl"
      className={cn(
        "overflow-hidden rounded-[22px] border transition-all duration-300",
        open
          ? "border-brand-secondary/40 bg-white shadow-[0_8px_30px_-12px_rgba(0,168,128,0.35)] dark:border-brand-secondary/30 dark:bg-[#121a18]"
          : isComplete
            ? "border-brand-secondary/30 bg-brand-background-green/40 dark:border-[#2f403b] dark:bg-[#121a18]"
            : "border-[#e8e8e8] bg-white dark:border-[#2f403b] dark:bg-[#161f1c]",
        isLocked && "opacity-60",
      )}
    >
      <button
        type="button"
        onClick={clickable ? onToggle : undefined}
        aria-expanded={open}
        aria-disabled={isLocked}
        disabled={isLocked}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-3.5 text-start transition-colors sm:px-5",
          clickable ? "cursor-pointer" : "cursor-not-allowed",
        )}
      >
        {/* Status badge: number → spinner-free check when complete, lock when locked */}
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold transition-all duration-300",
            isComplete
              ? "bg-brand-secondary text-white shadow-[0_0_0_4px_rgba(0,168,128,0.15)]"
              : open
                ? "bg-brand text-white shadow-[0_0_0_4px_rgba(0,168,128,0.15)] dark:bg-brand-secondary"
                : isLocked
                  ? "bg-[#eef0ef] text-[#b4b9b7] dark:bg-[#24302c] dark:text-[#6a7a74]"
                  : "bg-brand-background-green text-brand dark:bg-[#16352f] dark:text-[#48c0b8]",
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
                open
                  ? "text-brand dark:text-white"
                  : isComplete
                    ? "text-brand dark:text-[#8ff0d3]"
                    : "text-[#1a1a1a] dark:text-white",
              )}
            >
              {title}
            </span>
            {isComplete && !open ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-secondary/12 px-2 py-0.5 text-[11px] font-bold text-brand dark:bg-brand-secondary/20 dark:text-[#8ff0d3]">
                <Check className="size-3" aria-hidden />
                {completeLabel}
              </span>
            ) : null}
          </span>

          {/* Collapsed-complete → summary recap; otherwise the subtitle */}
          {!open && isComplete && summary ? (
            <span className="block truncate text-xs text-[#6f6f6f] dark:text-[#9fb4ac]">
              {summary}
            </span>
          ) : subtitle ? (
            <span className="block truncate text-xs text-[#9a9a9a] dark:text-[#8b9d97]">
              {isLocked && lockedLabel ? lockedLabel : subtitle}
            </span>
          ) : null}
        </span>

        {/* Trailing affordance: edit pill when collapsed-complete, chevron otherwise */}
        {!isLocked ? (
          !open && isComplete ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-brand-secondary/30 px-3 py-1.5 text-xs font-bold text-brand dark:border-brand-secondary/30 dark:text-[#48c0b8]">
              <Pencil className="size-3.5" aria-hidden />
              {editLabel}
            </span>
          ) : (
            <ChevronDown
              className={cn(
                "size-5 shrink-0 text-[#9a9a9a] transition-transform duration-300 dark:text-[#8b9d97]",
                open && "rotate-180",
              )}
              aria-hidden
            />
          )
        ) : null}
      </button>

      {/* Animated body — grid 0fr→1fr gives a smooth height fold without JS. */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-[#f0f0f0] px-4 py-4 sm:px-5 dark:border-[#2f403b]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
