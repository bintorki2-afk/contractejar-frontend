export type InvoiceStatus = "paid" | "unpaid" | "refunded" | "returned" | string;

export type ContractInvoiceItem = {
  index: number | string;
  /** Server line key: `fee`, `document_surcharge`, `meter_electricity`, `coupon`… */
  key: string | null;
  description: string;
  amount: number | null;
  amount_label: string;
  is_discount: boolean;
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
};

export type ContractInvoiceApiResponse = {
  message?: string;
  code?: number;
  success?: boolean;
  status?: string;
  data?: Record<string, unknown>;
};
