"use server";

import { getToken } from "@/actions/auth";
import { apiRequest } from "@/lib/api/api-request";

type FcmApiResponse = { message: string; code: number; success: boolean };

/**
 * Sends the browser's push token to the backend for the current session
 * (customer or guest). Without this the backend cannot target the web visitor
 * for contract-status pushes at all. Silently a no-op when there is no session.
 */
export async function registerFcmToken(fcmToken: string): Promise<boolean> {
  if (!fcmToken || !(await getToken())) {
    return false;
  }

  const response = await apiRequest<FcmApiResponse>("/fcm", {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify({ fcm_token: fcmToken }),
  });

  return Boolean(response.ok && response.data?.success);
}
