"use server";

import { apiRequest } from "@/lib/api/api-request";

export type TrackedOrder = {
  order_number: string;
  id: number;
  uuid: string;
  contract_type: "housing" | "commercial";
  name_real_estate: string | null;
  step: number;
  is_draft: boolean;
  is_paid: boolean;
  awaiting_payment: boolean;
  payment_url: string | null;
  status: string;
  status_label: string;
  status_color: string | null;
  status_client_explanation: string | null;
  timeline: Array<{ status_label: string; at: string | null }>;
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
