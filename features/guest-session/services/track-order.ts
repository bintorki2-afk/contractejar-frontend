"use server";

import { apiRequest } from "@/lib/api/api-request";

export type TrackedOrder = {
  /** `lessor_change` for a «تغيير المؤجر» request; absent/`contract` for a contract. */
  kind?: "contract" | "lessor_change" | string;
  order_number: string;
  id: number;
  uuid: string;
  contract_type: "housing" | "commercial" | "lessor_change";
  /** Lessor-change requests only. */
  fee?: number | null;
  name_real_estate: string | null;
  step: number;
  is_draft: boolean;
  is_paid: boolean;
  awaiting_payment: boolean;
  payment_url: string | null;
  status: string;
  /** Batch D: status resolved by case (`under_review`, `refunded`…), not by id. */
  status_case?: string | null;
  status_label: string;
  status_color: string | null;
  status_client_explanation: string | null;
  timeline: Array<{ status_label: string; at: string | null }>;
  /** ف2: the 6-step journey (contracts only). */
  journey?: unknown;
  journey_sentence?: string | null;
  smart_link?: string | null;
  /** Batch D (B8): refund state — `{status: full|partial, amount, refunded_at}`. */
  refund?: { status?: string | null; amount?: number | string | null; refunded_at?: string | null } | null;
  refunded_amount?: number | string | null;
  is_refunded?: boolean;
  created_at: string | null;
  updated_at: string | null;
};

type TrackOrderApiResponse = {
  message: string;
  code: number;
  success: boolean;
  data?: TrackedOrder;
};

/** Public order lookup (no account): order number + the mobile used on the order. */
export async function trackOrder(input: {
  order: string;
  mobile: string;
}): Promise<
  { ok: true; order: TrackedOrder } | { ok: false; notFound: boolean; error: string }
> {
  const response = await apiRequest<TrackOrderApiResponse>("/contract/track", {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify(input),
  });

  if (response.ok && response.data?.success && response.data.data) {
    return { ok: true, order: response.data.data };
  }

  return {
    ok: false,
    notFound: response.status === 404,
    error: response.error || response.data?.message || "Lookup failed",
  };
}
