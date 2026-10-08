"use server";

import type {
  ContractPaymentApiResponse,
  ContractPaymentData,
} from "@/features/create-contract/types/contract-payment";
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

function resolvePaymentUrl(data: ContractPaymentApiResponse | null | undefined) {
  if (!data) {
    return null;
  }

  return (
    data.payment_url ??
    data.Payment_url ??
    data.data?.payment_url ??
    data.data?.Payment_url ??
    null
  );
}

function resolvePaymentSuccessUrl(
  data: ContractPaymentApiResponse | null | undefined,
) {
  if (!data) {
    return null;
  }

  return data.payment_success_url ?? data.data?.payment_success_url ?? null;
}

function resolvePaymentErrorUrl(
  data: ContractPaymentApiResponse | null | undefined,
) {
  if (!data) {
    return null;
  }

  return data.payment_error_url ?? data.data?.payment_error_url ?? null;
}

export async function getContractPaymentUrl(contractUuid: string): Promise<
  | { ok: true; data: ContractPaymentData }
  | { ok: false; error: string }
> {
  let response: Response;
  let payload: ContractPaymentApiResponse | null = null;

  try {
    // `platform=web` + the website client header: the backend then builds the
    // success/error return URLs for the website (not the mobile deep links),
    // which it cannot infer from a server-side fetch with no Referer.
    response = await fetch(`${BASE_URL}/payment/${contractUuid}?platform=web`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        [WEBSITE_CLIENT_HEADER]: WEBSITE_CLIENT_ID,
        // Per-visitor rate limit on the API (not one budget for the whole site).
        ...(await clientIpHeaders()),
      },
    });

    payload = (await response.json().catch(() => null)) as ContractPaymentApiResponse | null;
  } catch {
    return {
      ok: false,
      error: NETWORK_ERROR_MESSAGE,
    };
  }

  const paymentUrl = resolvePaymentUrl(payload);

  if (!response.ok || !paymentUrl) {
    return {
      ok: false,
      error:
        // Gateway outage: the API now answers 503 with its own Arabic message —
        // shown as-is; older responses (400 «غير مسموح» + gateway_error) get ours.
        payload && typeof payload === "object" && "gateway_error" in payload && response.status < 500
          ? GATEWAY_ERROR_MESSAGE
          : getResponseErrorMessage(response.status, payload),
    };
  }

  return {
    ok: true,
    data: {
      paymentUrl,
      paymentSuccessUrl: resolvePaymentSuccessUrl(payload),
      paymentErrorUrl: resolvePaymentErrorUrl(payload),
      invoiceId: payload?.invoice_id ?? payload?.data?.invoice_id ?? null,
      contractUuid: payload?.contract_uuid ?? payload?.data?.contract_uuid ?? contractUuid,
      cartAmount: payload?.cart_amount ?? payload?.data?.cart_amount ?? null,
    },
  };
}
