"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type UnitAdditionalInfoSectionProps = {
  toggleLabel: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export default function UnitAdditionalInfoSection({
  toggleLabel,
  defaultOpen = false,
  children,
}: UnitAdditionalInfoSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border-brand/90 border-3 bg-white dark:bg-[#151c1b] dark:border-brand-secondary/70">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-12 w-full items-center justify-between gap-3 px-4 text-sm font-semibold text-brand"
      >
        <span>{toggleLabel}</span>
        <span className="inline-flex bg-brand-background-green size-8 shrink-0 items-center justify-center rounded-full border">
          <ChevronDown
            className={cn(
              "size-4 text-brand transition-transform ",
              open ? "rotate-180" : "rotate-0",
            )}
            aria-hidden="true"
          />
        </span>
      </button>

      {open ? (
        <div className="space-y-4 border-t border-[#f0f0f0] px-4 py-4 dark:border-[#2f403b]">
          {children}
        </div>
      ) : null}
    </div>
  );
}
