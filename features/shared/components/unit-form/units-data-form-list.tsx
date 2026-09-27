"use client";

import { ChevronUp } from "lucide-react";
import { useState, type ReactNode } from "react";

import {
  EMPTY_UNIT_DATA,
  type UnitDataState,
} from "@/features/create-unit/types/unit-data";
import { cn } from "@/lib/utils";

type UnitsDataFormListProps = {
  addUnitLabel: string;
  removeUnitLabel?: string;
  unitsCountLabel: string;
  unitSectionTitle: (index: number) => string;
  getUnitSummary?: (unit: UnitDataState, index: number) => string | null;
  units: UnitDataState[];
  onUnitsChange: (units: UnitDataState[]) => void;
  renderUnitForm: (
    unit: UnitDataState,
    index: number,
    onChange: (unit: UnitDataState) => void,
  ) => ReactNode;
  allowAddUnit?: boolean;
  allowRemoveUnit?: boolean;
  minUnits?: number;
  createEmptyUnit?: () => UnitDataState;
  className?: string;
};

function UnitFormCard({
  title,
  summary,
  removeLabel,
  showRemove,
  onRemove,
  children,
}: {
  title: string;
  summary: string | null;
  removeLabel?: string;
  showRemove: boolean;
  onRemove: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-secondary/30 bg-white dark:bg-[#151c1b] dark:border-brand-secondary/50">
      <div className="flex items-center gap-2 border-b border-[#f0f0f0] px-3 py-2 dark:border-[#2f403b]">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          <p className="shrink-0 text-sm font-extrabold text-brand">{title}</p>

          {summary ? (
            <span className="max-w-full truncate rounded-full bg-[#f0f0f0] dark:bg-[#141d1a] px-2 py-0.5 text-[11px] font-semibold text-[#666666] dark:text-white/60">
              {summary}
            </span>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {showRemove && removeLabel ? (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-full border border-[#e57373] px-3 py-1.5 text-xs font-bold text-[#c62828] transition-colors hover:bg-[#fff5f5] dark:border-red-400/40 dark:text-red-300 dark:hover:bg-red-500/10"
            >
              {removeLabel}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-label={title}
            className="inline-flex size-8 items-center justify-center rounded-full bg-brand-background-green border text-brand"
          >
            <ChevronUp
              className={cn(
                "size-4 transition-transform",
                open ? "rotate-0" : "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {open ? <div className="space-y-3 p-3 md:p-4">{children}</div> : null}
    </div>
  );
}

export default function UnitsDataFormList({
  addUnitLabel,
  removeUnitLabel,
  unitsCountLabel,
  unitSectionTitle,
  getUnitSummary,
  units,
  onUnitsChange,
  renderUnitForm,
  allowAddUnit = true,
  allowRemoveUnit = false,
  minUnits = 1,
  createEmptyUnit,
  className,
}: UnitsDataFormListProps) {
  function updateUnit(index: number, unit: UnitDataState) {
    onUnitsChange(
      units.map((current, currentIndex) =>
        currentIndex === index ? unit : current,
      ),
    );
  }

  function handleAddUnit() {
    onUnitsChange([
      ...units,
      createEmptyUnit ? createEmptyUnit() : { ...EMPTY_UNIT_DATA },
    ]);
  }

  function handleRemoveUnit(index: number) {
    if (units.length <= minUnits) {
      return;
    }

    onUnitsChange(units.filter((_, currentIndex) => currentIndex !== index));
  }

  const canRemove = allowRemoveUnit && units.length > minUnits;

  return (
    <div className={cn("space-y-6", className)}>
      {units.map((unit, index) => (
        <UnitFormCard
          key={`unit-form-${unit.unitId ?? index}`}
          title={unitSectionTitle(index)}
          summary={getUnitSummary?.(unit, index) ?? null}
          removeLabel={removeUnitLabel}
          showRemove={canRemove}
          onRemove={() => handleRemoveUnit(index)}
        >
          {renderUnitForm(unit, index, (nextUnit) =>
            updateUnit(index, nextUnit),
          )}
        </UnitFormCard>
      ))}

      {allowAddUnit ? (
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleAddUnit}
            className="flex h-11 w-full items-center justify-center rounded-2xl border border-dashed border-brand bg-brand-background text-sm font-bold text-brand transition-colors hover:bg-[#eef6f3] dark:border-brand-secondary/60 dark:bg-[#121a18] dark:text-white dark:hover:bg-[#1c2f29]"
          >
            + {addUnitLabel}
          </button>

          <p className="text-center text-xs text-[#7f7f7f] dark:text-white/50">
            {unitsCountLabel}: {units.length}
          </p>
        </div>
      ) : null}
    </div>
  );
}
