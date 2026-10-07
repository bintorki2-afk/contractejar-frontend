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
import { getErrorMessage } from "@/lib/api/get-error-message";

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
      },
    });

    payload = (await response.json().catch(() => null)) as ContractPaymentApiResponse | null;
  } catch {
    return {
      ok: false,
      error: "Network error",
    };
  }

  const paymentUrl = resolvePaymentUrl(payload);

  if (!response.ok || !paymentUrl) {
    return {
      ok: false,
      error:
        getErrorMessage(payload) ||
        payload?.message ||
        "Failed to initiate contract payment",
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
