import type { ContractInstrumentType } from "@/features/create-contract/types/instrument-type";
import type { PropertyContractType } from "@/features/create-property/utils/contract-type";

export type ContractPricingTier = {
  first_year: number;
  extra_year: number;
};

export type ContractPricing = {
  currency: string;
  housing: ContractPricingTier;
  commercial: ContractPricingTier;
  rule: string;
  includes_ejar_fees: boolean;
  note: string;
  document_surcharge: {
    fee: number;
    once_per_contract: boolean;
    instrument_types: ContractInstrumentType[];
    label: string;
  };
  meter_transfer_fee: {
    housing: { electricity: number; water: number };
    commercial: { electricity: number; water: number };
    label: string;
  };
  lessor_change_fee: number;
  vat_rate: number;
};

export type ContractPricingApiResponse = {
  message: string;
  code: number;
  success: boolean;
  data: ContractPricing;
};

/**
 * Last-known numbers so the wizard never renders an empty price while the
 * `/pricing` read is in flight (or fails). The server values always win.
 */
export const FALLBACK_CONTRACT_PRICING: ContractPricing = {
  currency: "SAR",
  housing: { first_year: 249, extra_year: 150 },
  commercial: { first_year: 349, extra_year: 250 },
  rule: "أي عقد لمدة سنة أو أقل يُحسب سنة؛ وكل سنة زيادة أو جزء منها تُحسب سنة إضافية.",
  includes_ejar_fees: true,
  note: "الأسعار شاملة جميع الرسوم بما فيها رسوم منصة إيجار.",
  document_surcharge: {
    fee: 75,
    once_per_contract: true,
    instrument_types: [
      "old_handwritten",
      "property_ownership_owner_are_deceased",
      "property_ownership_owner_are_deceased_endowment",
      "property_ownership_owner_is_endowment",
      "property_ownership_owner_are_suspended",
      "sale_agreement",
      "economic_cities_authority_suspended",
      "strong_argument",
    ],
    label: "رسوم إضافية لأنواع محددة من المستندات",
  },
  meter_transfer_fee: {
    housing: { electricity: 15, water: 15 },
    commercial: { electricity: 25, water: 25 },
    label: "رسوم نقل العداد باسم المستأجر (لكل عداد)",
  },
  lessor_change_fee: 400,
  vat_rate: 0,
};

export function getPricingTier(
  pricing: ContractPricing,
  contractType: PropertyContractType,
): ContractPricingTier {
  return contractType === "commercial" ? pricing.commercial : pricing.housing;
}

/**
 * Fee rule: any contract of one year or less counts as one year; every extra
 * year or part of it counts as an additional year.
 *   billable_years = ceil(total_months / 12)
 *   fee = first_year + (billable_years - 1) * extra_year
 */
export function computeContractFee(
  tier: ContractPricingTier,
  totalMonths: number,
): { billableYears: number; fee: number } {
  const months = Math.max(0, Math.floor(totalMonths));
  const billableYears = Math.max(1, Math.ceil(months / 12));

  return {
    billableYears,
    fee: tier.first_year + (billableYears - 1) * tier.extra_year,
  };
}

export function instrumentTypeHasSurcharge(
  pricing: ContractPricing,
  instrumentType: ContractInstrumentType | null | undefined,
): boolean {
  if (!instrumentType) {
    return false;
  }

  return pricing.document_surcharge.instrument_types.includes(instrumentType);
}

export function getMeterTransferFee(
  pricing: ContractPricing,
  contractType: PropertyContractType,
  meter: "electricity" | "water",
): number {
  const tier =
    contractType === "commercial"
      ? pricing.meter_transfer_fee.commercial
      : pricing.meter_transfer_fee.housing;

  return tier[meter];
}
