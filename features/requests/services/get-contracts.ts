"use server";

import type {
  ContractListItem,
  ContractsListApiResponse,
} from "@/features/requests/types/contract-list-item";
import { apiRequest } from "@/lib/api/api-request";

type GetContractsOptions = {
  page?: number;
};

export async function getContracts({
  page = 1,
}: GetContractsOptions = {}): Promise<ContractListItem[]> {
  const response = await apiRequest<ContractsListApiResponse>(
    `/contracts?page=${page}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok || !response.data?.success || !response.data.data) {
    // `status` lets the page tell an expired session (401) from an outage.
    throw Object.assign(
      new Error(response.error || response.data?.message || "Failed to fetch contracts"),
      { status: response.status },
    );
  }

  return response.data.data.data;
}
