import type { ContractPeriodOption } from "@/features/create-contract/types/contract-period";
import { resolveContractPeriodMonths } from "@/features/create-contract/types/contract-period";
import type { FinanceDataState } from "@/features/create-contract/types/finance-step";
import { resolveContractDurationMonths } from "@/features/create-contract/utils/payment-type-availability";
import { parseContractPeriodLabel } from "@/features/create-contract/utils/parse-contract-period-label";

/**
 * Total contract length in months from the finance draft: preset period
 * (12 / 24 …) or «مدة أخرى» years + months. `null` while nothing is chosen.
 */
export function resolveFinanceDurationMonths(
  financeData: FinanceDataState,
  periods: ContractPeriodOption[],
): number | null {
  if (financeData.isCustomDuration) {
    if (typeof financeData.customDurationYears !== "number") {
      return null;
    }

    const months =
      typeof financeData.customDurationMonths === "number"
        ? financeData.customDurationMonths
        : 0;

    return financeData.customDurationYears * 12 + months;
  }

  const period = periods.find((item) => item.id === financeData.contractPeriodId);
  if (!period) {
    return null;
  }

  const resolved = resolveContractDurationMonths({
    isCustomDuration: false,
    periodMonths: resolveContractPeriodMonths(period),
    periodLabel: parseContractPeriodLabel(period.period).title,
  });

  return typeof resolved === "number" ? resolved : null;
}
