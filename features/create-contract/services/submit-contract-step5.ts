"use server";

import type { ContractStep5ApiData } from "@/features/create-contract/types/contract-step5-api";
import {
  buildContractStep5Body,
  type ContractStep5Payload,
} from "@/features/create-contract/utils/build-contract-step5-payload";
import { apiRequest } from "@/lib/api/api-request";

type ContractStep5ApiResponse = {
  message: string;
  code: number;
  success: boolean;
  data?: ContractStep5ApiData;
};

export async function submitContractStep5(payload: ContractStep5Payload) {
  const response = await apiRequest<ContractStep5ApiResponse>("/contract/step5", {
    method: "POST",
    body: JSON.stringify(buildContractStep5Body(payload)),
    cache: "no-store",
  });

  if (!response.ok || !response.data?.success || !response.data.data) {
    return {
      ok: false as const,
      status: response.status,
      error:
        response.error ||
        response.data?.message ||
        "Failed to submit rented unit data",
    };
  }

  return {
    ok: true as const,
    data: response.data.data,
    message: response.data.message,
  };
}
