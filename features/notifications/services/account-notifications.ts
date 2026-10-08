"use server";

import { apiRequest } from "@/lib/api/api-request";

export type AccountNotification = {
  id: number;
  title: string;
  body: string;
  kind: string | null;
  /** Same-site path when the API sent a smart link (e.g. `/r/963031`). */
  href: string | null;
  isRead: boolean;
  createdAt: string | null;
};

type AccountNotificationsApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    unread_count?: number;
    data?: Array<{
      id: number;
      title?: string | null;
      body?: string | null;
      kind?: string | null;
      url?: string | null;
      smart_link?: string | null;
      is_read?: boolean;
      read_at?: string | null;
      created_at_iso?: string | null;
      created_at?: string | null;
    }>;
  };
};

/** Keep only an internal path: smart links point at the public site domain. */
function toInternalHref(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url, "https://contractejar.com");
    const path = `${parsed.pathname}${parsed.search}`;
    return /^\/(r|track|requests|lessor-change)(\/|\?|$)/.test(path) ? path : null;
  } catch {
    return null;
  }
}

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

  const items = (response.data.data?.data ?? []).map((item) => ({
    id: item.id,
    title: item.title?.trim() || "",
    body: item.body?.trim() || "",
    kind: item.kind ?? null,
    href: toInternalHref(item.smart_link ?? item.url),
    isRead: Boolean(item.is_read || item.read_at),
    createdAt: item.created_at_iso ?? item.created_at ?? null,
  }));

  return { ok: true, items };
}

export async function markAccountNotificationsRead(): Promise<void> {
  await apiRequest("/notifications/read-all", { method: "POST", cache: "no-store" });
}
