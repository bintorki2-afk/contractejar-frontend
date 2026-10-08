"use server";

import type { ContractStep4ApiData } from "@/features/create-contract/types/contract-step4-api";
import {
  appendContractStep4Fields,
  buildContractStep4Body,
  hasContractStep4PowerOfAttorneyFile,
  type ContractStep4Payload,
} from "@/features/create-contract/utils/build-contract-step4-payload";
import { apiFormDataRequest, apiRequest } from "@/lib/api/api-request";

type ContractStep4ApiResponse = {
  message: string;
  code: number;
  success: boolean;
  data?: ContractStep4ApiData;
};

export async function submitContractStep4(payload: ContractStep4Payload) {
  const hasPowerOfAttorneyFile = hasContractStep4PowerOfAttorneyFile(
    payload.tenantData,
  );

  const response = hasPowerOfAttorneyFile
    ? await submitContractStep4WithFormData(payload)
    : await submitContractStep4WithJson(payload);

  if (!response.ok || !response.data?.success || !response.data.data) {
    return {
      ok: false as const,
      status: response.status,
      error:
        response.error ||
        response.data?.message ||
        "Failed to submit tenant data",
    };
  }

  return {
    ok: true as const,
    data: response.data.data,
    message: response.data.message,
  };
}

async function submitContractStep4WithJson(payload: ContractStep4Payload) {
  return apiRequest<ContractStep4ApiResponse>("/contract/step4", {
    method: "POST",
    body: JSON.stringify(buildContractStep4Body(payload)),
  });
}

async function submitContractStep4WithFormData(payload: ContractStep4Payload) {
  const formData = new FormData();
  appendContractStep4Fields(formData, payload);

  return apiFormDataRequest<ContractStep4ApiResponse>(
    "/contract/step4",
    formData,
  );
}
