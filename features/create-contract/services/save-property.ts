"use server";

import type { SavePropertyApiResponse } from "@/features/create-contract/types/save-property-api";
import { apiRequest } from "@/lib/api/api-request";

type SavePropertyPayload = {
  contractId: number;
  nameRealEstate: string;
};

export async function saveProperty({
  contractId,
  nameRealEstate,
}: SavePropertyPayload) {
  const response = await apiRequest<SavePropertyApiResponse>("/save/property", {
    method: "POST",
    body: JSON.stringify({
      contract_id: contractId,
      name_real_estate: nameRealEstate,
    }),
    cache: "no-store",
  });

  if (!response.ok || !response.data?.success) {
    return {
      ok: false as const,
      error:
        response.error ||
        response.data?.message ||
        "Failed to save property data",
    };
  }

  return {
    ok: true as const,
    message: response.data.message,
  };
}

/** Undo «حفظ بيانات العقار» (`DELETE /save/property/{contract_id}`). */
export async function unsaveProperty(contractId: number) {
  const response = await apiRequest<SavePropertyApiResponse>(
    `/save/property/${contractId}`,
    {
      method: "DELETE",
      cache: "no-store",
    },
  );

  if (!response.ok || response.data?.success === false) {
    return {
      ok: false as const,
      error:
        response.error ||
        response.data?.message ||
        "Failed to remove saved property",
    };
  }

  return { ok: true as const, message: response.data?.message };
}
