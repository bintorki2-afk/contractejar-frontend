/**
 * أنواع إشعارات العميل (دفعة د، item 54 + دفعة هـ) — مصدر واحد لتصنيف الإشعار وعرضه.
 *
 * الخادم يرسل `kind` (OfferResource) وحقولاً إضافية إما في الجذر أو داخل `data`:
 *  - `refund`            → `amount` (المبلغ المسترجع بالريال)
 *  - `discount_applied`  → `coupon_code` / `amount`
 *  - `offer` / `announcement` → `coupon_code` + `valid_until` (اختياريان)
 *  - `assigned`, `data_missing` (`deep_link` للخطوة الناقصة + `request_id`), `status_changed`,
 *    `payment_success`, `notarized`, تذكيرات (`order_abandoned_*`, `awaiting_payment_2h`, `renewal_*`).
 *  - دفعة هـ: `charge_payment_request` (رسوم إضافية بانتظار الدفع، `amount`)،
 *    `price_difference` (فرق سعر بعد تعديل، `amount`). مرحلة «إرسال المسودة» أُلغيت
 *    (E3): إشعارات `draft_sent` القديمة تُعرض كـ «تحديث الطلب».
 * أي نوع غير معروف يُعرض كإشعار عام.
 */

export type NotificationTone = "brand" | "success" | "info" | "warning" | "offer" | "refund";

export type NotificationKindKey =
  | "refund"
  | "discount_applied"
  | "offer"
  | "announcement"
  | "assigned"
  | "data_missing"
  | "status_changed"
  | "payment_success"
  | "charge_payment_request"
  | "price_difference"
  | "notarized"
  | "reminder"
  | "general";

export type NotificationKindMeta = {
  key: NotificationKindKey;
  /** Short Arabic tag shown above the title. */
  tag: string;
  tone: NotificationTone;
};

const KIND_META: Record<NotificationKindKey, Omit<NotificationKindMeta, "key">> = {
  refund: { tag: "استرجاع مبلغ", tone: "refund" },
  discount_applied: { tag: "خصم مطبّق", tone: "success" },
  offer: { tag: "عرض خاص", tone: "offer" },
  announcement: { tag: "إعلان", tone: "offer" },
  assigned: { tag: "تم استلام طلبك", tone: "info" },
  data_missing: { tag: "بيانات ناقصة", tone: "warning" },
  status_changed: { tag: "تحديث الطلب", tone: "brand" },
  payment_success: { tag: "تم الدفع", tone: "success" },
  charge_payment_request: { tag: "رسوم بانتظار الدفع", tone: "warning" },
  price_difference: { tag: "فرق سعر", tone: "warning" },
  notarized: { tag: "تم التوثيق", tone: "success" },
  reminder: { tag: "تذكير", tone: "warning" },
  general: { tag: "إشعار", tone: "brand" },
};

const ALIASES: Record<string, NotificationKindKey> = {
  refund: "refund",
  refunded: "refund",
  payment_refunded: "refund",
  discount_applied: "discount_applied",
  coupon_applied: "discount_applied",
  offer: "offer",
  promotion: "offer",
  broadcast: "announcement",
  announcement: "announcement",
  assigned: "assigned",
  received_by_employee: "assigned",
  data_missing: "data_missing",
  missing_data: "data_missing",
  status_changed: "status_changed",
  lessor_change_status: "status_changed",
  payment_success: "payment_success",
  paid: "payment_success",
  charge_paid: "payment_success",
  // تاريخية فقط (E3): لا مرحلة مسودة بعد الآن.
  draft_sent: "status_changed",
  whatsapp_draft: "status_changed",
  charge_payment_request: "charge_payment_request",
  extra_fee: "charge_payment_request",
  price_difference: "price_difference",
  data_request_resolved: "status_changed",
  notarized: "notarized",
  ejar_authenticated: "notarized",
  completed: "notarized",
};

export function resolveNotificationKind(kind: string | null | undefined): NotificationKindMeta {
  const raw = (kind ?? "").trim().toLowerCase();
  let key: NotificationKindKey = ALIASES[raw] ?? "general";
  if (key === "general" && /^(order_abandoned|awaiting_payment|renewal)/.test(raw)) {
    key = "reminder";
  }
  return { key, ...KIND_META[key] };
}

/** Kinds that change what the customer sees on an order (refresh the order views). */
export const ORDER_AFFECTING_KINDS: ReadonlySet<NotificationKindKey> = new Set([
  "refund",
  "discount_applied",
  "assigned",
  "data_missing",
  "status_changed",
  "payment_success",
  "charge_payment_request",
  "price_difference",
  "notarized",
]);

function pick(sources: Array<Record<string, unknown> | null>, keys: string[]): unknown {
  for (const source of sources) {
    if (!source) continue;
    for (const key of keys) {
      const value = source[key];
      if (value !== undefined && value !== null && value !== "") return value;
    }
  }
  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string" && value.trim().startsWith("{")) {
    try {
      return asRecord(JSON.parse(value));
    } catch {
      return null;
    }
  }
  return null;
}

function asText(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function asAmount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export type NotificationExtras = {
  couponCode: string | null;
  /** ISO / date string when the offer/coupon expires. */
  validUntil: string | null;
  /** Refund / discount amount (SAR). */
  amount: number | null;
  orderNumber: string | null;
  /** Wizard step to complete (`data_missing`). */
  step: number | null;
  /** دفعة هـ: رابط عميق `…/r/{order}?fix={id}&step={n}` (data_missing) أو رابط الدفع. */
  deepLink: string | null;
  /** دفعة هـ: معرّف طلب المرفق الناقص (data_missing). */
  requestId: number | null;
  /** دفعة هـ: معرّف الرسم (charge_payment_request / price_difference). */
  chargeId: number | null;
  /** QA W-12: the charge was cancelled after this notification was sent. */
  cancelled: boolean;
};

/** Reads coupon / validity / amount from the root or the `data` object. */
export function extractNotificationExtras(item: Record<string, unknown>): NotificationExtras {
  const data = asRecord(item.data);
  const coupon = asRecord(pick([item, data], ["coupon"]));
  const sources = [item, data, coupon];

  const stepValue = asAmount(pick([item, data], ["step", "missing_step"]));

  return {
    couponCode: asText(pick(sources, ["coupon_code", "code", "promo_code"])) ??
      (typeof pick([item, data], ["coupon"]) === "string" ? asText(pick([item, data], ["coupon"])) : null),
    validUntil: asText(pick(sources, ["valid_until", "expires_at", "end_date", "valid_to", "expiry_date"])),
    amount: asAmount(pick(sources, ["refund_amount", "refunded_amount", "amount", "charge_amount", "discount_amount"])),
    orderNumber: asText(pick([item, data], ["order_number", "contract_uuid", "uuid"])),
    step: stepValue != null && stepValue >= 1 && stepValue <= 7 ? Math.trunc(stepValue) : null,
    deepLink: asText(pick([item, data], ["deep_link", "fix_link"])),
    requestId: asAmount(pick([item, data], ["request_id", "data_request_id"])),
    chargeId: asAmount(pick([item, data], ["charge_id"])),
    cancelled: pick([item, data], ["cancelled"]) === true,
  };
}

/** «صالح حتى 15 أكتوبر 2026» — Gregorian, Latin digits, Riyadh time. */
export function formatValidUntil(value: string | null): string | null {
  if (!value) return null;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T23:59:59+03:00` : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
    dateStyle: "long",
    timeZone: "Asia/Riyadh",
  }).format(date);
}

export function isExpired(value: string | null, now: Date = new Date()): boolean {
  if (!value) return false;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T23:59:59+03:00` : value;
  const date = new Date(normalized);
  return !Number.isNaN(date.getTime()) && date.getTime() < now.getTime();
}
