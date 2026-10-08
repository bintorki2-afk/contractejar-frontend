"use server";

import {
  BASE_URL,
  WEBSITE_CLIENT_HEADER,
  WEBSITE_CLIENT_ID,
} from "@/lib/api/constants";
import { clientIpHeaders } from "@/lib/api/api-request";
import {
  getResponseErrorMessage,
  NETWORK_ERROR_MESSAGE,
} from "@/lib/api/get-error-message";

// The API answers a gateway outage with a generic «غير مسموح» plus raw
// `gateway_error` (cURL/host details): show a clear Arabic message instead.
const GATEWAY_ERROR_MESSAGE =
  "تعذّر الاتصال ببوابة الدفع حالياً. طلبك محفوظ — حاول بعد قليل أو تواصل معنا عبر واتساب.";

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
          // Per-visitor rate limit on the API (not one budget for the whole site).
          ...(await clientIpHeaders()),
        },
      },
    );
    payload = (await response.json().catch(() => null)) as
      | LessorChangePaymentApiResponse
      | null;
  } catch {
    return { ok: false, error: NETWORK_ERROR_MESSAGE };
  }

  if (payload?.already_paid === true || payload?.data?.already_paid === true) {
    return { ok: true, alreadyPaid: true };
  }

  const paymentUrl = payload?.payment_url ?? payload?.data?.payment_url ?? null;

  if (!response.ok || !paymentUrl) {
    return {
      ok: false,
      error:
        payload && typeof payload === "object" && "gateway_error" in payload
          ? GATEWAY_ERROR_MESSAGE
          : getResponseErrorMessage(response.status, payload),
    };
  }

  return { ok: true, paymentUrl };
}
