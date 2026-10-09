import { extractNotificationExtras } from "@/features/notifications/utils/notification-kinds";

export type AccountNotification = {
  id: number;
  title: string;
  body: string;
  kind: string | null;
  /** Same-site path when the API sent a smart link (e.g. `/r/963031`). */
  href: string | null;
  isRead: boolean;
  createdAt: string | null;
  /** Offer / announcement / discount coupon (copy button on the site). */
  couponCode: string | null;
  validUntil: string | null;
  /** Refund / discount amount in SAR. */
  amount: number | null;
  /** Order number (contract uuid / lessor-change uuid) the notification belongs to. */
  orderNumber: string | null;
};

export type AccountNotificationApiItem = {
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
  order_number?: string | null;
  contract_uuid?: string | null;
  coupon_code?: string | null;
  valid_until?: string | null;
  amount?: number | string | null;
  data?: Record<string, unknown> | null;
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

export function toAccountNotification(item: AccountNotificationApiItem): AccountNotification {
  const extras = extractNotificationExtras(item as unknown as Record<string, unknown>);
  return {
    id: item.id,
    title: item.title?.trim() || "",
    body: item.body?.trim() || "",
    kind: item.kind ?? null,
    // دفعة هـ: رابط «مطلوب منك» العميق (`/r/{order}?fix=…`) له الأولوية على الرابط الذكي العام.
    href: toInternalHref(extras.deepLink) ?? toInternalHref(item.smart_link ?? item.url),
    isRead: Boolean(item.is_read || item.read_at),
    createdAt: item.created_at_iso ?? item.created_at ?? null,
    couponCode: extras.couponCode,
    validUntil: extras.validUntil,
    amount: extras.amount,
    orderNumber: item.order_number?.trim() || item.contract_uuid?.trim() || extras.orderNumber,
  };
}

