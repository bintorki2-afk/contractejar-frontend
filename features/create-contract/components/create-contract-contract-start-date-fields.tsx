"use client";

import CreateContractDateEquivalentHint from "@/features/create-contract/components/create-contract-date-equivalent-hint";
import CreateContractFormSelect from "@/features/create-contract/components/create-contract-form-select";
import type {
  BirthDateValue,
  CalendarType,
} from "@/features/create-contract/types/owner-step";
import { getTodayContractStartDate } from "@/features/create-contract/utils/get-today-contract-start-date";
import { cn } from "@/lib/utils";

type ContractStartDateLabels = {
  label: string;
  hijri: string;
  gregorian: string;
  day: string;
  month: string;
  year: string;
  dayPlaceholder: string;
  monthPlaceholder: string;
  yearPlaceholder: string;
  correspondingHijri: string;
  correspondingGregorian: string;
};

type CreateContractContractStartDateFieldsProps = {
  labels: ContractStartDateLabels;
  value: BirthDateValue;
  onChange: (value: BirthDateValue) => void;
  invalid?: boolean;
};

function padOptions(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const value = String(index + 1).padStart(2, "0");
    return { value, label: value };
  });
}

function getYearOptions(calendarType: CalendarType) {
  const currentGregorianYear = new Date().getFullYear();

  if (calendarType === "hijri") {
    const start = 1440;
    const end = 1460;

    return Array.from({ length: end - start + 1 }, (_, index) => {
      const year = String(end - index);
      return { value: year, label: year };
    });
  }

  return Array.from({ length: 11 }, (_, index) => {
    const year = String(currentGregorianYear + index);
    return { value: year, label: year };
  });
}

export default function CreateContractContractStartDateFields({
  labels,
  value,
  onChange,
  invalid = false,
}: CreateContractContractStartDateFieldsProps) {
  const dayCount = value.calendarType === "hijri" ? 30 : 31;

  function updateField<K extends keyof BirthDateValue>(
    field: K,
    fieldValue: BirthDateValue[K],
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
      ...(field === "calendarType"
        ? getTodayContractStartDate(fieldValue as CalendarType)
        : {}),
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-black">
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
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
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
          options={padOptions(dayCount)}
          value={value.day}
          onChange={(dayValue) => updateField("day", dayValue)}
          variant="compact"
          invalid={invalid && value.day === ""}
        />

        <CreateContractFormSelect
          label={labels.month}
          placeholder={labels.monthPlaceholder}
          options={padOptions(12)}
          value={value.month}
          onChange={(monthValue) => updateField("month", monthValue)}
          variant="compact"
          invalid={invalid && value.month === ""}
        />

        <CreateContractFormSelect
          label={labels.year}
          placeholder={labels.yearPlaceholder}
          options={getYearOptions(value.calendarType)}
          value={value.year}
          onChange={(yearValue) => updateField("year", yearValue)}
          variant="compact"
          invalid={invalid && value.year === ""}
        />
      </div>

      {/* «الموافق …» always shows the OTHER calendar's equivalent. */}
      <CreateContractDateEquivalentHint value={value} />
    </div>
  );
}
