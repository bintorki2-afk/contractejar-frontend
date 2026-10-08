"use client";

import { useId, type ComponentType } from "react";

import { Input } from "@/components/ui/input";
import type { ManualDeedEntryLabels } from "@/features/shared/types/manual-deed-entry-labels";
import {
  normalizeInstrumentNumber,
  type ManualDeedEntryData,
} from "@/features/shared/types/manual-deed-entry";
import { getInstrumentHistoryYearOptions } from "@/lib/validation/instrument-history-year-options";
import {
  fieldChromeControlClass,
  fieldChromeSurfaceClass,
  resolveFieldChromeState,
} from "@/lib/ui/field-chrome";
import { cn } from "@/lib/utils";

type FormSelectProps = {
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hideLabel?: boolean;
  variant?: "default" | "compact";
  invalid?: boolean;
  valid?: boolean;
};

type FieldLabelProps = {
  label: string;
};

type ManualDeedEntryFormProps = {
  labels: ManualDeedEntryLabels;
  value: ManualDeedEntryData;
  onChange: (value: ManualDeedEntryData) => void;
  FormSelect: ComponentType<FormSelectProps>;
  FieldLabel: ComponentType<FieldLabelProps>;
  showFieldErrors?: boolean;
};

function padOptions(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const value = String(index + 1).padStart(2, "0");
    return { value, label: value };
  });
}

function RequiredFieldLabel({
  label,
  invalid = false,
}: {
  label: string;
  invalid?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          "text-sm font-semibold",
          invalid ? "text-[#c62828]" : "text-[#333333] dark:text-white",
        )}
      >
        {label}
      </span>
      <span className="text-red-500" aria-hidden="true">
        *
      </span>
    </div>
  );
}

export default function ManualDeedEntryForm({
  labels,
  value,
  onChange,
  FormSelect,
  showFieldErrors = false,
}: ManualDeedEntryFormProps) {
  const inputId = useId();
  const dayCount = value.typeInstrumentHistory === "hijri" ? 30 : 31;
  const yearOptions = getInstrumentHistoryYearOptions(value.typeInstrumentHistory);
  const selectedYear = yearOptions.some((option) => option.value === value.instrumentHistoryYear)
    ? value.instrumentHistoryYear
    : "";
  const instrumentNumberValid = value.instrumentNumber.trim().length > 0;
  const instrumentNumberInvalid = showFieldErrors && !instrumentNumberValid;
  const dayInvalid = showFieldErrors && value.instrumentHistoryDay === "";
  const monthInvalid = showFieldErrors && value.instrumentHistoryMonth === "";
  const yearInvalid = showFieldErrors && selectedYear === "";
  const instrumentDateInvalid = dayInvalid || monthInvalid || yearInvalid;
  const instrumentNumberChrome = resolveFieldChromeState({
    invalid: instrumentNumberInvalid,
    valid: instrumentNumberValid,
  });

  function updateField<K extends keyof ManualDeedEntryData>(
    field: K,
    fieldValue: ManualDeedEntryData[K],
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
      ...(field === "typeInstrumentHistory"
        ? {
            instrumentHistoryDay: "",
            instrumentHistoryMonth: "",
            instrumentHistoryYear: "",
          }
        : {}),
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <RequiredFieldLabel
          label={labels.instrumentNumber.label}
          invalid={instrumentNumberInvalid}
        />

        <Input
          id={inputId}
          inputMode="numeric"
          pattern="[0-9]*"
          value={value.instrumentNumber}
          placeholder={labels.instrumentNumber.placeholder}
          aria-invalid={instrumentNumberInvalid}
          onChange={(event) =>
            updateField(
              "instrumentNumber",
              normalizeInstrumentNumber(event.target.value),
            )
          }
          className={cn(
            "h-10 rounded-2xl px-4 text-start text-sm font-semibold placeholder:text-[#cfcfcf] md:text-sm",
            fieldChromeControlClass,
            fieldChromeSurfaceClass(instrumentNumberChrome),
          )}
        />

        <p className="text-xs text-[#8a8a8a] dark:text-white/50">{labels.instrumentNumber.hint}</p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <RequiredFieldLabel
            label={labels.instrumentDate.label}
            invalid={instrumentDateInvalid}
          />

          <div className="inline-flex shrink-0 items-center rounded-full bg-[#f0f0f0] dark:bg-[#141d1a] p-1">
            {(["hijri", "gregorian"] as const).map((calendarType) => (
              <button
                key={calendarType}
                type="button"
                onClick={() => updateField("typeInstrumentHistory", calendarType)}
                className={cn(
                  "min-h-9 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors sm:px-5",
                  value.typeInstrumentHistory === calendarType
                    ? "bg-brand text-white"
                    : "text-[#555555] dark:text-white/60 hover:text-[#333333] dark:hover:text-white/80",
                )}
              >
                {labels.instrumentDate[calendarType]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <FormSelect
            label={labels.instrumentDate.day}
            placeholder={labels.instrumentDate.dayPlaceholder}
            options={padOptions(dayCount)}
            value={value.instrumentHistoryDay}
            onChange={(day) => updateField("instrumentHistoryDay", day)}
            hideLabel
            variant="compact"
            valid={value.instrumentHistoryDay !== ""}
            invalid={dayInvalid}
          />

          <FormSelect
            label={labels.instrumentDate.month}
            placeholder={labels.instrumentDate.monthPlaceholder}
            options={padOptions(12)}
            value={value.instrumentHistoryMonth}
            onChange={(month) => updateField("instrumentHistoryMonth", month)}
            hideLabel
            variant="compact"
            valid={value.instrumentHistoryMonth !== ""}
            invalid={monthInvalid}
          />

          <FormSelect
            label={labels.instrumentDate.year}
            placeholder={labels.instrumentDate.yearPlaceholder}
            options={yearOptions}
            value={selectedYear}
            onChange={(year) => updateField("instrumentHistoryYear", year)}
            hideLabel
            variant="compact"
            valid={selectedYear !== ""}
            invalid={yearInvalid}
          />
        </div>
      </div>
    </div>
  );
}
