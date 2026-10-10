"use client";

import { Minus, Plus } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { digitsOnly } from "@/lib/utils/digits";

type UnitOptionalCountFieldProps = {
  label: string;
  enabled: boolean;
  count: string;
  onEnabledChange: (enabled: boolean) => void;
  onCountChange: (count: string) => void;
  max?: number;
};

function parseCount(value: string) {
  const parsed = Number(digitsOnly(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function formatCount(value: number) {
  return String(value).padStart(2, "0");
}

export default function UnitOptionalCountField({
  label,
  enabled,
  count,
  onEnabledChange,
  onCountChange,
  max = 99,
}: UnitOptionalCountFieldProps) {
  const currentCount = enabled ? parseCount(count) : 1;

  function setCount(nextCount: number) {
    onCountChange(formatCount(Math.min(max, Math.max(1, nextCount))));
  }

  return (
    <div
      dir="rtl"
      className="flex items-center justify-between gap-4"
    >
      <label className="flex cursor-pointer items-center gap-2">
        <Checkbox
          checked={enabled}
          onCheckedChange={(value) => {
            const nextEnabled = value === true;
            onEnabledChange(nextEnabled);
            if (nextEnabled && count === "") {
              onCountChange("01");
            }
            if (!nextEnabled) {
              onCountChange("");
            }
          }}
          className="size-5 rounded-full border-brand-secondary data-checked:border-brand-secondary data-checked:bg-brand-secondary"
        />
        <span className="text-sm font-semibold text-black">{label}</span>
      </label>

      <div
        dir="ltr"
        className={cn(
          "flex items-center gap-2",
          !enabled && "pointer-events-none opacity-40",
        )}
      >
        <button
          type="button"
          aria-label={`إنقاص ${label}`}
          disabled={!enabled || currentCount <= 1}
          onClick={() => setCount(currentCount - 1)}
          className="inline-flex size-8 items-center justify-center rounded-full bg-[#1a1a1a] text-white disabled:opacity-40"
        >
          <Minus className="size-4" />
        </button>

        <span className="min-w-8 text-center text-sm font-semibold text-[#333333]">
          {enabled ? formatCount(currentCount) : "00"}
        </span>

        <button
          type="button"
          aria-label={`زيادة ${label}`}
          disabled={!enabled || currentCount >= max}
          onClick={() => setCount(currentCount + 1)}
          className="inline-flex size-8 items-center justify-center rounded-full bg-[#1a1a1a] text-white disabled:opacity-40"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}
