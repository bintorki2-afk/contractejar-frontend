"use server";

import { getToken, isGuestSession } from "@/actions/auth";
import {
  toAccountNotification,
  type AccountNotification,
  type AccountNotificationApiItem,
} from "@/features/notifications/utils/to-account-notification";
import { apiRequest } from "@/lib/api/api-request";

export type { AccountNotification };

type AccountNotificationsApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    unread_count?: number;
    data?: AccountNotificationApiItem[] | null;
  };
};

/**
 * The account's notifications stored on the server (payment received, draft
 * sent on WhatsApp, notarized, reminders…). `keep_unread=1`: reading the list
 * must not mark them read by itself (see `markAccountNotificationsRead`).
 */
export async function getAccountNotifications(): Promise<
  { ok: true; items: AccountNotification[] } | { ok: false; status: number }
> {
  const response = await apiRequest<AccountNotificationsApiResponse>(
    "/notifications?keep_unread=1",
    { method: "GET", cache: "no-store" },
  );

  if (!response.ok || !response.data?.success) {
    return { ok: false, status: response.status };
  }

  const items = (response.data.data?.data ?? []).map(toAccountNotification);

  return { ok: true, items };
}

export async function markAccountNotificationsRead(): Promise<void> {
  await apiRequest("/notifications/read-all", { method: "POST", cache: "no-store" });
}

/**
 * Notifications of one order (track page / order dialog) for a signed-in
 * customer. Not signed in (or a guest session the API refuses) → `ok:false`
 * and the section stays hidden.
 */
export async function getOrderNotifications(
  orderNumber: string,
): Promise<{ ok: true; items: AccountNotification[] } | { ok: false; status: number }> {
  const wanted = String(orderNumber ?? "").trim();
  if (!wanted) {
    return { ok: false, status: 400 };
  }

  // Signed-in customers only: a guest token would get 401 from the API, and a
  // 401 clears the session cookie (the guest would lose access to the order).
  if (!(await getToken()) || (await isGuestSession())) {
    return { ok: false, status: 401 };
  }

  const response = await apiRequest<AccountNotificationsApiResponse>(
    `/notifications?keep_unread=1&per_page=50&order_number=${encodeURIComponent(wanted)}`,
    { method: "GET", cache: "no-store" },
  );

  if (!response.ok || !response.data?.success) {
    return { ok: false, status: response.status };
  }

  const items = (response.data.data?.data ?? [])
    .map(toAccountNotification)
    .filter((item) => item.orderNumber === wanted);

  return { ok: true, items };
}
