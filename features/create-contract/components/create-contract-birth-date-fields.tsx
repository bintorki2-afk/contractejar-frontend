"use client";

import CreateContractDateEquivalentHint from "@/features/create-contract/components/create-contract-date-equivalent-hint";
import CreateContractFormSelect from "@/features/create-contract/components/create-contract-form-select";
import type { BirthDateValue } from "@/features/create-contract/types/owner-step";
import {
  getAdultBirthDayOptions,
  getAdultBirthMonthOptions,
  getAdultBirthYearOptions,
  isAdultBirthDateComplete,
  isAtLeastAdultAge,
} from "@/lib/validation/birth-date-year-options";
import { cn } from "@/lib/utils";

type BirthDateLabels = {
  label: string;
  hijri: string;
  gregorian: string;
  day: string;
  month: string;
  year: string;
  dayPlaceholder: string;
  monthPlaceholder: string;
  yearPlaceholder: string;
};

type CreateContractBirthDateFieldsProps = {
  labels: BirthDateLabels;
  value: BirthDateValue;
  onChange: (value: BirthDateValue) => void;
  invalid?: boolean;
};

export default function CreateContractBirthDateFields({
  labels,
  value,
  onChange,
  invalid = false,
}: CreateContractBirthDateFieldsProps) {
  const yearOptions = getAdultBirthYearOptions(value.calendarType);
  const monthOptions = getAdultBirthMonthOptions(
    value.calendarType,
    value.year,
  );
  const dayOptions = getAdultBirthDayOptions(
    value.calendarType,
    value.year,
    value.month,
  );
  const selectedYear = yearOptions.some((option) => option.value === value.year)
    ? value.year
    : "";
  const selectedMonth = monthOptions.some((option) => option.value === value.month)
    ? value.month
    : "";
  const selectedDay = dayOptions.some((option) => option.value === value.day)
    ? value.day
    : "";
  const underAge =
    value.day !== "" &&
    value.month !== "" &&
    value.year !== "" &&
    !isAtLeastAdultAge(value);
  const showInvalid = invalid || underAge;
  const birthDateValid = !showInvalid && isAdultBirthDateComplete(value);
  const dayInvalid = showInvalid && (selectedDay === "" || underAge);
  const monthInvalid = showInvalid && (selectedMonth === "" || underAge);
  const yearInvalid = showInvalid && (selectedYear === "" || underAge);

  function updateField<K extends keyof BirthDateValue>(
    field: K,
    fieldValue: BirthDateValue[K],
  ) {
    const nextValue: BirthDateValue = {
      ...value,
      [field]: fieldValue,
      ...(field === "calendarType"
        ? { day: "", month: "", year: "" }
        : {}),
    };

    if (field === "year") {
      const nextMonthOptions = getAdultBirthMonthOptions(
        nextValue.calendarType,
        String(fieldValue),
      );
      if (!nextMonthOptions.some((option) => option.value === nextValue.month)) {
        nextValue.month = "";
        nextValue.day = "";
      } else {
        const nextDayOptions = getAdultBirthDayOptions(
          nextValue.calendarType,
          String(fieldValue),
          nextValue.month,
        );
        if (!nextDayOptions.some((option) => option.value === nextValue.day)) {
          nextValue.day = "";
        }
      }
    }

    if (field === "month") {
      const nextDayOptions = getAdultBirthDayOptions(
        nextValue.calendarType,
        nextValue.year,
        String(fieldValue),
      );
      if (!nextDayOptions.some((option) => option.value === nextValue.day)) {
        nextValue.day = "";
      }
    }

    onChange(nextValue);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label
          className={cn(
            "text-sm font-semibold",
            showInvalid ? "text-[#c62828]" : "text-black",
          )}
        >
          {labels.label}
          <span className="text-red-500"> *</span>
        </label>

        <div className="flex items-center rounded-full bg-[#f0f0f0] p-1">
          {(["hijri", "gregorian"] as const).map((calendarType) => (
            <button
              key={calendarType}
              type="button"
              onClick={() => updateField("calendarType", calendarType)}
              className={cn(
                "min-h-9 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                value.calendarType === calendarType
                  ? "bg-brand text-white shadow-sm"
                  : "text-[#7f7f7f] hover:text-[#555555]",
              )}
            >
              {labels[calendarType]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <CreateContractFormSelect
          label={labels.day}
          placeholder={labels.dayPlaceholder}
          options={dayOptions}
          value={selectedDay}
          onChange={(day) => updateField("day", day)}
          invalid={dayInvalid}
          valid={birthDateValid || (!showInvalid && selectedDay !== "")}
          variant="compact"
        />

        <CreateContractFormSelect
          label={labels.month}
          placeholder={labels.monthPlaceholder}
          options={monthOptions}
          value={selectedMonth}
          onChange={(month) => updateField("month", month)}
          invalid={monthInvalid}
          valid={birthDateValid || (!showInvalid && selectedMonth !== "")}
          variant="compact"
        />

        <CreateContractFormSelect
          label={labels.year}
          placeholder={labels.yearPlaceholder}
          options={yearOptions}
          value={selectedYear}
          onChange={(year) => updateField("year", year)}
          invalid={yearInvalid}
          valid={birthDateValid || (!showInvalid && selectedYear !== "")}
          variant="compact"
        />
      </div>

      {birthDateValid ? <CreateContractDateEquivalentHint value={value} /> : null}
    </div>
  );
}
