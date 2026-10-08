"use client";

import { Minus, Plus } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { digitsOnly } from "@/lib/utils/digits";

type UnitCountStepperProps = {
  label: string;
  /** Colored Lucide icon shown beside the label. */
  icon?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  required?: boolean;
  max?: number;
  className?: string;
};

function parseCount(value: string) {
  if (value === "") {
    return 0;
  }

  const parsed = Number(digitsOnly(value));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function formatCount(value: number) {
  return value === 0 ? "" : String(value);
}

export default function UnitCountStepper({
  label,
  icon,
  value,
  onChange,
  hint,
  required = false,
  max = 99,
  className,
}: UnitCountStepperProps) {
  const currentCount = parseCount(value);
  const canDecrease = currentCount > 0;
  const canIncrease = currentCount < max;

  function setCount(nextCount: number) {
    const clamped = Math.min(max, Math.max(0, nextCount));
    onChange(formatCount(clamped));
  }

  return (
    <div className={cn("space-y-2 text-center", className)}>
      <div>
        <p className="inline-flex items-center justify-center gap-1.5 text-sm font-bold text-brand">
          {icon ? (
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-background-green dark:bg-[#16352f]">
              {icon}
            </span>
          ) : null}
          <span>
            {label}
            {required ? <span className="text-red-500"> *</span> : null}
          </span>
        </p>
        {hint ? (
          <p className="mt-1 text-[11px] leading-4 text-[#9a9a9a]">{hint}</p>
        ) : null}
      </div>

      <div
        dir="ltr"
        className="flex h-10 w-full items-center justify-center gap-3 rounded-2xl bg-[#f1f7f5] px-1.5 dark:bg-[#16352f]"
      >
        <button
          type="button"
          aria-label="decrease"
          disabled={!canDecrease}
          onClick={() => setCount(currentCount - 1)}
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-white transition-colors sm:size-8",
            canDecrease ? "bg-brand" : "bg-[#c8d6d2] dark:bg-[#2f403b]",
          )}
        >
          <Minus className="size-4" />
        </button>

        <span className="min-w-6 text-center text-sm font-bold text-[#1a1a1a] dark:text-white">
          {currentCount}
        </span>

        <button
          type="button"
          aria-label="increase"
          disabled={!canIncrease}
          onClick={() => setCount(currentCount + 1)}
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-white transition-colors sm:size-8",
            canIncrease ? "bg-brand" : "bg-[#c8d6d2] dark:bg-[#2f403b]",
          )}
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}
