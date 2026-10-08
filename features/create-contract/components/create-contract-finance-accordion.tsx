"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import { ChevronDown, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

type CreateContractFinanceAccordionProps = {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  collapsedSummary?: ReactNode;
  /** Leading badge icon; defaults to a plus (an optional add-on section). */
  icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
};

/**
 * Optional expandable section inside the finance step. Shares the visual
 * language of CreateContractStageCard (rounded card, badge, chevron,
 * smooth grid 0fr→1fr fold) but without the numbered/locked/complete stage
 * semantics — it's a toggleable add-on, not a sequential step.
 */
export default function CreateContractFinanceAccordion({
  title,
  subtitle,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  collapsedSummary,
  icon,
  children,
}: CreateContractFinanceAccordionProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;
  const Icon = icon ?? Plus;
  const hasSummary = Boolean(collapsedSummary);

  function handleToggle() {
    const next = !open;

    if (!isControlled) {
      setUncontrolledOpen(next);
    }

    onOpenChange?.(next);
  }

  return (
    <div
      dir="rtl"
      className={cn(
        "overflow-hidden rounded-[22px] border transition-all duration-300",
        open
          ? "border-brand-secondary/40 bg-white shadow-[0_8px_30px_-12px_rgba(0,168,128,0.35)] dark:border-brand-secondary/30 dark:bg-[#121a18]"
          : hasSummary
            ? "border-brand-secondary/30 bg-brand-background-green/40 dark:border-[#2f403b] dark:bg-[#121a18]"
            : "border-[#e8e8e8] bg-white dark:border-[#2f403b] dark:bg-[#161f1c]",
      )}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-start sm:px-5"
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-300",
            open
              ? "bg-brand text-white shadow-[0_0_0_4px_rgba(0,168,128,0.15)] dark:bg-brand-secondary"
              : "bg-brand-background-green text-brand dark:bg-[#16352f] dark:text-[#48c0b8]",
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>

        <span className="min-w-0 flex-1 space-y-0.5">
          <span
            className={cn(
              "block text-base font-extrabold",
              open ? "text-brand dark:text-white" : "text-[#1a1a1a] dark:text-white",
            )}
          >
            {title}
          </span>
          {subtitle ? (
            <span className="block text-xs leading-5 text-[#9a9a9a] dark:text-[#8b9d97]">
              {subtitle}
            </span>
          ) : null}
        </span>

        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-[#9a9a9a] transition-transform duration-300 dark:text-[#8b9d97]",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {/* Collapsed recap stays outside the header button so its own controls
          (e.g. a clear button) remain clickable. */}
      {!open && hasSummary ? (
        <div className="px-4 pb-3 sm:px-5">{collapsedSummary}</div>
      ) : null}

      {/* Animated body — grid 0fr→1fr gives a smooth height fold without JS. */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 border-t border-[#f0f0f0] px-4 py-4 sm:px-5 dark:border-[#2f403b]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
