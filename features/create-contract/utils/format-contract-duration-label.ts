import type { ContractPeriodOption } from "@/features/create-contract/types/contract-period";
import type { FinanceDataState } from "@/features/create-contract/types/finance-step";
import { resolveFinanceDurationMonths } from "@/features/create-contract/utils/resolve-finance-duration-months";

type DurationLabels = {
  /** "{count} سنة" */
  yearsCount: string;
  /** "{count} شهر" */
  monthsCount: string;
  oneYear: string;
  twoYears: string;
};

function withCount(template: string, count: number) {
  return template.replaceAll("{count}", String(count));
}

/**
 * Human label of the chosen duration: «سنة» / «سنتين» for the presets, or
 * "X سنة Y شهر" for «مدة أخرى». Empty while nothing is chosen.
 */
export function formatContractDurationLabel(
  financeData: FinanceDataState,
  periods: ContractPeriodOption[],
  labels: DurationLabels,
): string {
  const totalMonths = resolveFinanceDurationMonths(financeData, periods);

  if (totalMonths === null || totalMonths <= 0) {
    return "";
  }

  if (totalMonths === 12) {
    return labels.oneYear;
  }

  if (totalMonths === 24) {
    return labels.twoYears;
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  return [
    years > 0 ? withCount(labels.yearsCount, years) : null,
    months > 0 ? withCount(labels.monthsCount, months) : null,
  ]
    .filter((part): part is string => Boolean(part))
    .join(" ");
}
