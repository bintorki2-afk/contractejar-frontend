"use client";

import { useQuery } from "@tanstack/react-query";

import { contractPricingKeys } from "@/features/pricing/query-keys";
import { getContractPricing } from "@/features/pricing/services/get-contract-pricing";
import {
  FALLBACK_CONTRACT_PRICING,
  type ContractPricing,
} from "@/features/pricing/types/contract-pricing";

/**
 * `/pricing` with a stable fallback so every consumer can render numbers
 * synchronously; `pricing` is never undefined.
 */
export function useContractPricing() {
  const query = useQuery({
    queryKey: contractPricingKeys.detail(),
    queryFn: getContractPricing,
    staleTime: 5 * 60 * 1000,
  });

  const pricing: ContractPricing = query.data ?? FALLBACK_CONTRACT_PRICING;

  return { ...query, pricing, isFallback: !query.data };
}
