export type ContractPeriodOption = {
  id: number;
  period: string;
  note: string;
  /** Length in months (12 = سنة, 24 = سنتين). */
  months?: number | null;
  is_active?: boolean;
};

/** Months of a preset period: the API value, falling back to the label. */
export function resolveContractPeriodMonths(
  period: ContractPeriodOption | undefined,
): number | null {
  if (!period) {
    return null;
  }

  if (typeof period.months === "number" && period.months > 0) {
    return period.months;
  }

  return null;
}

export type ContractPeriodsApiResponse = {
  message: string;
  code: number;
  success: boolean;
  data: ContractPeriodOption[];
};
