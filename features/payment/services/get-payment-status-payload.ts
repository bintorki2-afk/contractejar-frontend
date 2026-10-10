"use server";

import { getToken } from "@/actions/auth";
import { clientIpHeaders } from "@/lib/api/api-request";
import {
  BASE_URL,
  WEBSITE_CLIENT_HEADER,
  WEBSITE_CLIENT_ID,
} from "@/lib/api/constants";

/**
 * Payment result for the success/error screens, fetched from the server with
 * the customer's (or guest's) session token: the API only returns
 * `contract_id`/`payment` to the order owner or with the gateway ids
 * (APP-4/DASHBOARD-7). The browser could not send the httpOnly token itself.
 * Returns the raw JSON (the failure payload is useful too) or null.
 */
export async function getPaymentStatusPayload(
  status: "success" | "error",
  contractUuid: string,
  query: { id?: string | null; invoice_id?: string | null; status?: string | null },
): Promise<unknown> {
  const safeUuid = encodeURIComponent(String(contractUuid).slice(0, 64));
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, String(value).slice(0, 200));
  }
  const token = await getToken();

  try {
    const response = await fetch(
      `${BASE_URL}/status/${status}/${safeUuid}${params.size ? `?${params}` : ""}`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          [WEBSITE_CLIENT_HEADER]: WEBSITE_CLIENT_ID,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(await clientIpHeaders()),
        },
        signal: AbortSignal.timeout(20000),
      },
    );
    // QA ORDERS-RES-14 / WEB-28: an unknown order must not read as «فشلت
    // عملية الدفع» with a retry button. A 404 (or `data.exists === false`)
    // is passed on as a not-found marker.
    if (response.status === 404) {
      return { not_found: true };
    }
    return await response.json().catch(() => null);
  } catch {
    return null;
  }
}
