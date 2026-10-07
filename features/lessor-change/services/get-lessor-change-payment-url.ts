"use server";

import {
  BASE_URL,
  WEBSITE_CLIENT_HEADER,
  WEBSITE_CLIENT_ID,
} from "@/lib/api/constants";
import { getErrorMessage } from "@/lib/api/get-error-message";

type LessorChangePaymentApiResponse = {
  message?: string;
  success?: boolean;
  payment_url?: string | null;
  already_paid?: boolean;
  data?: {
    payment_url?: string | null;
    already_paid?: boolean;
    invoice_id?: string | number | null;
    total?: number | null;
  } | null;
};

/**
 * `GET /payment/lessor-change/{uuid}?platform=web` → the Moyasar page URL.
 * Same shape/handling as the contract payment-url read.
 */
export async function getLessorChangePaymentUrl(uuid: string): Promise<
  | { ok: true; paymentUrl: string }
  | { ok: true; alreadyPaid: true }
  | { ok: false; error: string }
> {
  let response: Response;
  let payload: LessorChangePaymentApiResponse | null = null;

  try {
    response = await fetch(
      `${BASE_URL}/payment/lessor-change/${encodeURIComponent(uuid)}?platform=web`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          [WEBSITE_CLIENT_HEADER]: WEBSITE_CLIENT_ID,
        },
      },
    );
    payload = (await response.json().catch(() => null)) as
      | LessorChangePaymentApiResponse
      | null;
  } catch {
    return { ok: false, error: "Network error" };
  }

  if (payload?.already_paid === true || payload?.data?.already_paid === true) {
    return { ok: true, alreadyPaid: true };
  }

  const paymentUrl = payload?.payment_url ?? payload?.data?.payment_url ?? null;

  if (!response.ok || !paymentUrl) {
    return {
      ok: false,
      error:
        getErrorMessage(payload) ||
        payload?.message ||
        "Failed to initiate the lessor change payment",
    };
  }

  return { ok: true, paymentUrl };
}
