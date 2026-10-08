export type PaymentTypeKind =
  | "monthly"
  | "quarterly"
  | "semi-annual"
  | "annual"
  | "prepaid"
  | "other";

export type ContractDurationMonths = number | "custom" | null;

/**
 * Classify API payment type names (Arabic / English keywords).
 */
export function classifyPaymentTypeName(name: string): PaymentTypeKind {
  const normalized = name.trim().toLowerCase();

  if (/مقدم|مقدما|prepaid|advance|up\s*front/.test(normalized)) {
    return "prepaid";
  }

  if (/نصف\s*سنو|semi[-\s]?annual|biannual|نصف/.test(normalized)) {
    return "semi-annual";
  }

  if (/ربع\s*سنو|quarter|ربع/.test(normalized)) {
    return "quarterly";
  }

  if (/شهري|month/.test(normalized)) {
    return "monthly";
  }

  if (/سنو|annual|year/.test(normalized) && !/نصف|ربع/.test(normalized)) {
    return "annual";
  }

  return "other";
}

/**
 * Resolve selected contract length in months.
 * Preset periods are parsed from Arabic labels like "3 شهور" / "سنة" / "سنتين".
 */
export function resolveContractDurationMonths(input: {
  isCustomDuration: boolean;
  /** Months straight from the API period row (preferred over label parsing). */
  periodMonths?: number | null;
  periodLabel?: string | null;
  customYears?: number | "";
  customMonths?: number | "";
}): ContractDurationMonths {
  if (input.isCustomDuration) {
    return "custom";
  }

  if (typeof input.periodMonths === "number" && input.periodMonths > 0) {
    return input.periodMonths;
  }

  const label = input.periodLabel?.trim() ?? "";
  if (!label) {
    return null;
  }

  const monthsMatch = label.match(/(\d+)\s*(?:شهر|شهور|أشهر)/i);
  if (monthsMatch) {
    return Number(monthsMatch[1]);
  }

  if (/سنتين|سنتان/i.test(label)) {
    return 24;
  }

  if (
    /^سنة$/i.test(label) ||
    /^عام$/i.test(label) ||
    /سنة\s*واحدة/i.test(label) ||
    /(?:^|\s)1\s*(?:سنة|سنوات|عام)/i.test(label)
  ) {
    return 12;
  }

  const yearsMatch = label.match(/(\d+)\s*(?:سنة|سنوات|أعوام|عام)/i);
  if (yearsMatch) {
    return Number(yearsMatch[1]) * 12;
  }

  return null;
}

/**
 * Payment methods allowed for a given contract duration:
 * - 3 months → monthly, quarterly, prepaid
 * - 6 months → monthly, quarterly, semi-annual, prepaid
 * - ≥ 1 year or custom → all
 */
export function isPaymentTypeAllowedForDuration(
  kind: PaymentTypeKind,
  durationMonths: ContractDurationMonths,
): boolean {
  if (durationMonths === null || durationMonths === "custom") {
    return true;
  }

  if (durationMonths <= 3) {
    return kind === "monthly" || kind === "quarterly" || kind === "prepaid";
  }

  if (durationMonths <= 6) {
    return (
      kind === "monthly" ||
      kind === "quarterly" ||
      kind === "semi-annual" ||
      kind === "prepaid"
    );
  }

  return true;
}
