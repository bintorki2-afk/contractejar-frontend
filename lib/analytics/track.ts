/**
 * أحداث التحويل (GTM dataLayer) — المصدر الواحد لكل الأحداث التسويقية في الموقع.
 *
 * `track(event, params)` يدفع `{ event, ...params }` إلى `window.dataLayer`.
 * بدون GTM (`NEXT_PUBLIC_GTM_ID` فارغ) لا يحدث شيء. قائمة الأحداث وكيفية ربطها
 * بوسوم Google Ads / Snap / TikTok موثّقة في `docs/analytics-events.md`.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type ContractTypeParam = "housing" | "commercial" | "lessor_change" | string;

export type AnalyticsEventMap = {
  /** بدء المعالج (أول فتح لنوع عقد). */
  wizard_start: { contract_type: ContractTypeParam };
  /** الوصول لخطوة في المعالج: 1..6 أو "review". */
  wizard_step: { contract_type: ContractTypeParam; step: number | "review" };
  /** إرسال الطلب للخادم بنجاح (قبل الدفع). */
  order_submitted: { order_number: string; contract_type: ContractTypeParam; value?: number };
  /** الانتقال لبوابة الدفع. */
  payment_started: { order_number: string; value?: number; contract_type?: ContractTypeParam };
  /** دفع ناجح (مرة واحدة لكل طلب). */
  purchase: {
    transaction_id: string;
    value: number | undefined;
    currency: "SAR";
    contract_type: ContractTypeParam;
  };
  /** إرسال طلب تغيير المؤجر. */
  lessor_change_submitted: { order_number?: string; value?: number };
  /** ضغط أي زر واتساب (hero / الدعم / الطلبات…). */
  cta_whatsapp_click: { placement: string };
  /** طلب رمز تحقق OTP. */
  otp_requested: { context: string };
  /** نجاح التحقق من OTP. */
  otp_verified: { context: string };
  /** تحويل قديم محفوظ للتوافق مع الوسوم المضبوطة سابقاً. */
  generate_lead: {
    order_number: string;
    contract_type: ContractTypeParam;
    currency: "SAR";
    value?: number;
  };
};

export type AnalyticsEventName = keyof AnalyticsEventMap;

function isGtmEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_GTM_ID);
}

/**
 * Push one event to the GTM dataLayer. Safe on the server and when GTM is
 * disabled (no-op). Never throws.
 */
export function track<E extends AnalyticsEventName>(
  event: E,
  params: AnalyticsEventMap[E],
): void {
  if (typeof window === "undefined" || !isGtmEnabled()) {
    return;
  }

  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...params });
  } catch {
    // Analytics must never break the UI.
  }
}

/** Raw push for non-typed events (kept for GTM-specific objects). */
export function pushToDataLayer(event: Record<string, unknown>): void {
  if (typeof window === "undefined" || !isGtmEnabled()) {
    return;
  }

  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);
  } catch {
    // Analytics must never break the UI.
  }
}

const PURCHASE_STORAGE_PREFIX = "aqdi:purchase:";

/**
 * `purchase` fired once per order per browser session (guards against page
 * refreshes on the payment-success screen re-firing the conversion).
 */
export function trackPurchaseOnce(params: AnalyticsEventMap["purchase"]): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const key = `${PURCHASE_STORAGE_PREFIX}${params.transaction_id}`;
  try {
    if (window.sessionStorage.getItem(key) === "1") {
      return false;
    }
    window.sessionStorage.setItem(key, "1");
  } catch {
    // sessionStorage unavailable — fire anyway (better one duplicate than none).
  }

  track("purchase", params);
  return true;
}
