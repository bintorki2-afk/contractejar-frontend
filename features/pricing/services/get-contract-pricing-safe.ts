"use server";

import { cache } from "react";

import { getContractPricing } from "@/features/pricing/services/get-contract-pricing";
import {
  FALLBACK_CONTRACT_PRICING,
  type ContractPricing,
} from "@/features/pricing/types/contract-pricing";

/**
 * Server-side `/pricing` read that never throws (marketing pages must render
 * even when the API is down). The constants in `FALLBACK_CONTRACT_PRICING`
 * are the only last-resort numbers in the code (rule 13).
 */
export const getContractPricingSafe = cache(
  async function getContractPricingSafe(): Promise<ContractPricing> {
    try {
      return await getContractPricing();
    } catch {
      return FALLBACK_CONTRACT_PRICING;
    }
  },
);
