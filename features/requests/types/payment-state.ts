/**
 * دفعة هـ (E2/E4/E5) — أشكال الخادم لحالة الدفع والرسوم وطلبات المرفق الناقص
 * كما تصل في مورد العقد (`GET /contracts/{id}`، قائمة `/contracts`)، وفي
 * `POST /contract/track`، وفي الفاتورة `GET /invoices/{id}`.
 *
 * الخادم هو المصدر الوحيد للأرقام والحالات؛ الموقع يعرض فقط ولا يحسب أي مبلغ.
 */

export type PaymentStateStatus =
  | "unpaid"
  | "paid"
  | "partially_paid"
  | "partially_refunded"
  | "refunded";

export type PaymentMethod = "moyasar" | "bank_transfer" | "mixed";

export type PaymentState = {
  status: PaymentStateStatus | string;
  status_label: string;
  method: PaymentMethod | string | null;
  method_label: string | null;
  due_total: number | null;
  paid_total: number | null;
  outstanding: number | null;
  refunded_total: number | null;
  net_total: number | null;
  refund_due: number | null;
  pending_charges_count: number;
  pending_charges_total: number | null;
  /** «مدفوع · Moyasar · 279 ر.س» — جاهزة للعرض كما هي. */
  label: string;
  is_paid: boolean;
};

export type ContractChargeKind = "price_difference" | "extra_fee";
export type ContractChargeStatus = "pending" | "paid" | "cancelled";

export type ContractCharge = {
  id: number;
  kind: ContractChargeKind | string;
  kind_label: string;
  amount: number;
  /** الرسالة التي كتبها الموظف — تُعرض للعميل كما هي. */
  message: string;
  status: ContractChargeStatus | string;
  status_label: string;
  /** `GET /contracts/{uuid}/charges/{cid}/pay` (عند الانتظار فقط). */
  payment_url: string | null;
  paid_at: string | null;
  created_at: string | null;
};

export type PendingDataRequestItem = {
  key: string;
  label: string;
  /** خطوة الخادم (1 الصك · 2 العنوان · 3 المالك · 4 المستأجر). */
  step: number | null;
  fields: string[];
};

export type PendingDataRequest = {
  id: number;
  section: "lessor" | "property" | "tenant" | string;
  section_label: string;
  items: PendingDataRequestItem[];
  note: string | null;
  requested_at: string | null;
  /** أول خطوة مطلوبة (الخادم يحدّدها). */
  step: number | null;
  /** كل الخطوات المفتوحة للتعديل في وضع التصحيح. */
  steps: number[];
  /** `…/r/{order}?fix={id}&step={n}` */
  deep_link: string | null;
  /** «مطلوب منك: … — …» جاهزة للعرض. */
  banner: string;
};

export type PaymentTransaction = {
  id: number | string;
  kind: "original" | "price_difference" | "extra_fee" | "bank_transfer" | "refund" | string;
  kind_label: string;
  amount: number;
  method: string | null;
  method_label: string | null;
  status: string | null;
  status_label: string | null;
  paid_at: string | null;
  reference: string | null;
  card_last4: string | null;
  reason: string | null;
  receipt_url: string | null;
  charge_id: number | null;
};

export type PaymentTotals = {
  original: number | null;
  extra: number | null;
  refunded: number | null;
  net: number | null;
  due: number | null;
  outstanding: number | null;
  refund_due: number | null;
};

export type PaymentDetails = {
  transactions: PaymentTransaction[];
  charges: ContractCharge[];
  invoice_number: string | null;
  /** صفحة الفاتورة الموقّعة القابلة للطباعة على الخادم. */
  invoice_url: string | null;
  totals: PaymentTotals;
  state: PaymentState | null;
};
