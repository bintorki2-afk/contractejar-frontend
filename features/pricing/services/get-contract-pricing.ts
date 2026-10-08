"use server";

import type {
  ContractPricing,
  ContractPricingApiResponse,
} from "@/features/pricing/types/contract-pricing";
import { apiRequest } from "@/lib/api/api-request";

/** Public price sheet (`GET /pricing`) — the single source for every fee shown in the wizard. */
export async function getContractPricing(): Promise<ContractPricing> {
  const response = await apiRequest<ContractPricingApiResponse>("/pricing", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok || !response.data?.success || !response.data.data) {
    throw new Error(
      response.error || response.data?.message || "Failed to fetch pricing",
    );
  }

  return response.data.data;
}
