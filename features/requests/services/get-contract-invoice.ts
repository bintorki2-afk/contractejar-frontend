"use server";

import type {
  ContractInvoice,
  ContractInvoiceApiResponse,
} from "@/features/requests/types/contract-invoice";
import { normalizeContractInvoice } from "@/features/requests/utils/normalize-contract-invoice";
import { apiRequest } from "@/lib/api/api-request";

export type GetContractInvoiceResult =
  | { ok: true; data: ContractInvoice }
  | { ok: false; error: string };

type GetContractInvoiceOptions = {
  contractId: number;
};

function extractInvoicePayload(
  response: Awaited<ReturnType<typeof apiRequest<ContractInvoiceApiResponse>>>,
): Record<string, unknown> | null {
  if (!response.ok || !response.data) {
    return null;
  }

  const root = response.data as ContractInvoiceApiResponse &
    Record<string, unknown>;

  if (root.data && typeof root.data === "object" && !Array.isArray(root.data)) {
    const data = root.data as Record<string, unknown>;
    if (typeof data.invoice_number === "string" || Array.isArray(data.items)) {
      return data;
    }
  }

  if (typeof root.invoice_number === "string" || Array.isArray(root.items)) {
    return root as Record<string, unknown>;
  }

  return null;
}

/**
 * ف1: the invoice (lines, subtotal, discount, VAT, total) comes only from the
 * backend — `GET /invoices/{contractId}` (alias `/contracts/{id}/invoice`).
 * No client-side composition from `/financial` any more.
 */
export async function getContractInvoice({
  contractId,
}: GetContractInvoiceOptions): Promise<GetContractInvoiceResult> {
  const paths = [`/invoices/${contractId}`, `/contracts/${contractId}/invoice`];
  let lastError = "";

  for (const path of paths) {
    const response = await apiRequest<ContractInvoiceApiResponse>(path, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      lastError = response.error || response.data?.message || `HTTP ${response.status}`;
      continue;
    }

    const payload = extractInvoicePayload(response);
    if (!payload) {
      lastError = response.data?.message || "Invalid invoice payload";
      continue;
    }

    return { ok: true, data: normalizeContractInvoice(payload, contractId) };
  }

  return { ok: false, error: lastError || "Failed to fetch invoice" };
}
