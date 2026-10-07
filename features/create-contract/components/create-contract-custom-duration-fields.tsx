"use client";

import CreateContractFormSelect from "@/features/create-contract/components/create-contract-form-select";

export const CUSTOM_CONTRACT_DURATION_VALUE = "other";

type CustomDurationLabels = {
  yearsLabel: string;
  yearsPlaceholder: string;
  monthsLabel: string;
  monthsPlaceholder: string;
  yearOption: string;
  monthOption: string;
  monthOptionZero: string;
};

type CreateContractCustomDurationFieldsProps = {
  labels: CustomDurationLabels;
  years: number | "";
  months: number | "";
  onYearsChange: (years: number) => void;
  onMonthsChange: (months: number) => void;
};

const YEAR_OPTIONS = Array.from({ length: 30 }, (_, index) => index + 1);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => index);

function withTemplate(
  template: string,
  values: Record<string, string | number>,
) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

/**
 * «مدة أخرى»: years + months only (no days, no end date). The fee preview is
 * rendered by the parent so it covers the preset chips too.
 */
export default function CreateContractCustomDurationFields({
  labels,
  years,
  months,
  onYearsChange,
  onMonthsChange,
}: CreateContractCustomDurationFieldsProps) {
  const resolvedYears = years === "" ? 1 : years;
  const resolvedMonths = months === "" ? 0 : months;

  const yearOptions = YEAR_OPTIONS.map((year) => ({
    value: String(year),
    label: withTemplate(labels.yearOption, { count: year }),
  }));

  const monthOptions = MONTH_OPTIONS.map((month) => ({
    value: String(month),
    label:
      month === 0
        ? labels.monthOptionZero
        : withTemplate(labels.monthOption, { count: month }),
  }));

  return (
    <div className="flex gap-3">
      <CreateContractFormSelect
        label={labels.yearsLabel}
        placeholder={labels.yearsPlaceholder}
        options={yearOptions}
        value={String(resolvedYears)}
        onChange={(nextYears) => onYearsChange(Number(nextYears))}
        variant="compact"
      />
      <CreateContractFormSelect
        label={labels.monthsLabel}
        placeholder={labels.monthsPlaceholder}
        options={monthOptions}
        value={String(resolvedMonths)}
        onChange={(nextMonths) => onMonthsChange(Number(nextMonths))}
        variant="compact"
      />
    </div>
  );
}
