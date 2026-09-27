"use client";

import { ChevronUp } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type UnitBasicSectionProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export default function UnitBasicSection({
  title,
  defaultOpen = true,
  children,
}: UnitBasicSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div dir="rtl" className="overflow-hidden rounded-2xl border border-[#e8e8e8] dark:border-[#262d2c]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-12 w-full items-center justify-between bg-[#f7f7f7] dark:bg-[#141d1a] px-4 text-sm font-extrabold text-brand"
      >
        <span>{title}</span>
        <ChevronUp
          className={cn(
            "size-5 shrink-0 text-[#9a9a9a] dark:text-white/50 transition-transform",
            open ? "rotate-0" : "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="space-y-4 border-t border-[#f0f0f0] dark:border-[#262d2c] bg-white dark:bg-[#151c1b] px-4 py-4">
          {children}
        </div>
      ) : null}
    </div>
  );
}
