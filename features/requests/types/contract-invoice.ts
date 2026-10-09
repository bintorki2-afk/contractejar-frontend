import type {
  ContractCharge,
  PaymentState,
  PaymentTotals,
  PaymentTransaction,
} from "@/features/requests/types/payment-state";

export type InvoiceStatus =
  | "paid"
  | "unpaid"
  | "partially_paid"
  | "partially_refunded"
  | "refunded"
  | "returned"
  | string;

export type ContractInvoiceItem = {
  index: number | string;
  /** Server line key: `fee`, `document_surcharge`, `meter_electricity`, `coupon`… */
  key: string | null;
  description: string;
  amount: number | null;
  amount_label: string;
  is_discount: boolean;
  /** دفعة هـ: `fee|document|meter|discount|vat|extra_fee|price_difference|refund` (قد يغيب). */
  kind: string | null;
  charge_id: number | null;
};

/**
 * Invoice as returned by `GET /invoices/{contractId}` (ف1): lines come from
 * the backend pricing engine (`ContractPricing`) — the website never
 * computes invoice lines itself.
 */
export type ContractInvoice = {
  contractId: number;
  kind: "contract" | "lessor_change" | string;
  platform_name: string;
  platform_subtitle: string;
  title: string;
  invoice_number: string;
  datetime_label: string;
  reference_number: string | null;
  customer_name: string | null;
  order_number: string;
  contract_type_label: string;
  items: ContractInvoiceItem[];
  subtotal: number | null;
  subtotal_label: string;
  discount: number | null;
  discount_label: string;
  coupon_code: string | null;
  vat: number | null;
  vat_label: string;
  total_due_label: string;
  total_amount_label: string;
  total_amount: number | null;
  amount_mismatch: boolean;
  status: InvoiceStatus | null;
  status_label: string;
  status_color: string | null;
  print_label: string;
  is_paid: boolean;
  is_refunded: boolean;
  /** دفعة هـ (E5): الفاتورة التراكمية — الأصل + الإضافي − المسترجع = الصافي (كلها من الخادم). */
  is_cumulative: boolean;
  original_total_label: string;
  extra_total_label: string;
  refunded_total_label: string;
  net_total_label: string;
  totals: PaymentTotals;
  transactions: PaymentTransaction[];
  charges: ContractCharge[];
  payment_state: PaymentState | null;
  payment_method_label: string | null;
  /** صفحة الفاتورة الموقّعة على الخادم (طباعة / PDF). */
  invoice_url: string | null;
};

export type ContractInvoiceApiResponse = {
  message?: string;
  code?: number;
  success?: boolean;
  status?: string;
  data?: Record<string, unknown>;
};
