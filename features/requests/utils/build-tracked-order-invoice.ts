import type { ContractInvoice } from "@/features/requests/types/contract-invoice";
import type { RequestInvoiceDialogLabels } from "@/features/requests/types/request-invoice-labels";
import { normalizeContractInvoice } from "@/features/requests/utils/normalize-contract-invoice";
import {
  formatSar,
  normalizePaymentDetails,
  normalizePaymentState,
} from "@/features/requests/utils/normalize-payment-state";

type TrackedOrderLike = {
  id: number;
  order_number: string;
  contract_type?: string | null;
  payment_state?: unknown;
  payment_details?: unknown;
  charges?: unknown;
  created_at?: string | null;
};

type BuildTrackedOrderInvoiceOptions = {
  labels: RequestInvoiceDialogLabels;
  contractTypeLabel: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function formatRiyadhDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * دفعة هـ (W-2): فاتورة صفحة التتبّع (`/track` و `/r/{order}`) من رد
 * `POST /contract/track` نفسه — `payment_details` يحمل البنود (`lines`)
 * والإجماليات التراكمية وسجل الدفعات ورابط الفاتورة الموقّع — بلا نداء
 * `GET /invoices/{id}` (يتطلّب جلسة صاحب الطلب، والتتبّع بلا حساب).
 * لا يُحسب أي مبلغ هنا: كل الأرقام من الخادم. يعيد `null` إن لم تكن هناك
 * دفعة مسجّلة بعد (لا فاتورة لعرضها).
 */
export function buildTrackedOrderInvoice(
  order: TrackedOrderLike,
  { labels, contractTypeLabel }: BuildTrackedOrderInvoiceOptions,
): ContractInvoice | null {
  const rawDetails = asRecord(order.payment_details);
  const details = normalizePaymentDetails(rawDetails);
  if (!rawDetails || !details) {
    return null;
  }

  const state = normalizePaymentState(order.payment_state) ?? details.state;
  const paidTotal = state?.paid_total ?? 0;
  const hasPayment =
    details.transactions.length > 0 ||
    paidTotal > 0 ||
    (details.totals.net ?? 0) > 0 ||
    Boolean(details.invoice_url);
  if (!hasPayment) {
    return null;
  }

  const lines = Array.isArray(rawDetails.lines) ? rawDetails.lines : [];
  const items = lines
    .map((line) => asRecord(line))
    .filter((line): line is Record<string, unknown> => line !== null)
    .map((line, index) => ({
      index: index + 1,
      key: line.key,
      description: line.label,
      amount: line.amount,
      amount_label:
        typeof line.amount === "number" ? `${formatSar(line.amount)} ريال` : undefined,
      kind: line.kind,
      charge_id: line.charge_id,
    }));

  const net = details.totals.net ?? paidTotal;
  const latestPaidAt =
    details.transactions
      .map((transaction) => transaction.paid_at)
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) ?? order.created_at ?? null;

  return normalizeContractInvoice(
    {
      contract_id: order.id,
      kind: "contract",
      platform_name: labels.platformName,
      platform_subtitle: labels.platformSubtitle,
      title: labels.title,
      invoice_number: details.invoice_number ?? "",
      datetime_label: formatRiyadhDate(latestPaidAt),
      order_number: order.order_number,
      contract_type_label: contractTypeLabel,
      items,
      total_due_label: labels.totalDueLabel,
      total_amount: net,
      total_amount_label: `${formatSar(net)} ريال`,
      status: state?.status ?? (paidTotal > 0 ? "paid" : "unpaid"),
      status_label: state?.status_label ?? (paidTotal > 0 ? labels.paidStatusLabel : labels.unpaidStatusLabel),
      print_label: labels.printLabel,
      is_paid: state?.is_paid ?? paidTotal > 0,
      totals: details.totals,
      transactions: rawDetails.transactions,
      charges: rawDetails.charges ?? order.charges,
      payment_state: state,
      payment_method_label: state?.method_label ?? null,
      invoice_url: details.invoice_url,
    },
    order.id,
  );
}
