"use server";

import type { ContractStep3ApiData } from "@/features/create-contract/types/contract-step3-api";
import {
  appendContractStep3Fields,
  type ContractStep3FormPayload,
} from "@/features/create-contract/utils/build-contract-step3-form-data";
import { apiFormDataRequest } from "@/lib/api/api-request";

type ContractStep3ApiResponse = {
  message: string;
  code: number;
  success: boolean;
  data?: ContractStep3ApiData;
};

export async function submitContractStep3(payload: ContractStep3FormPayload) {
  const formData = new FormData();
  appendContractStep3Fields(formData, payload);

  const response = await apiFormDataRequest<ContractStep3ApiResponse>(
    "/contract/step3",
    formData,
  );

  if (!response.ok || !response.data?.success || !response.data.data) {
    return {
      ok: false as const,
      status: response.status,
      error: response.error || response.data?.message || "Failed to submit owner data",
    };
  }

  return {
    ok: true as const,
    data: response.data.data,
    message: response.data.message,
  };
}
