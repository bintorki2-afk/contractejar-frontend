"use client";

import { ExternalLink, Printer, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import PaymentStateChip from "@/features/requests/components/payment-state-chip";
import { getContractInvoice } from "@/features/requests/services/get-contract-invoice";
import type { ContractInvoice } from "@/features/requests/types/contract-invoice";
import type { PaymentTransaction } from "@/features/requests/types/payment-state";
import type { RequestInvoiceDialogLabels } from "@/features/requests/types/request-invoice-labels";
import { formatSar } from "@/features/requests/utils/normalize-payment-state";

/** تسميات القسم التراكمي وسجل الدفعات (دفعة هـ) — ثابتة بالعربية. */
const CUMULATIVE_LABELS = {
  original: "المدفوع الأصلي",
  extra: "رسوم إضافية / فرق سعر",
  refunded: "المسترجع",
  net: "الصافي المدفوع",
  outstanding: "المتبقي بانتظار الدفع",
  transactions: "سجل الدفعات",
  method: "طريقة الدفع",
  reference: "المرجع",
  receipt: "إيصال الحوالة",
  serverInvoice: "فتح الفاتورة الرسمية (PDF)",
};

function formatTransactionDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
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
 * الفاتورة التراكمية (دفعة هـ): الأصل + الإضافي − المسترجع = الصافي، مع
 * المتبقي عند وجود رسوم معلّقة. يظهر فقط عندما توجد حركة بعد الدفعة الأصلية.
 */
function InvoiceCumulativeTotals({ invoice, print = false }: InvoiceDocumentProps & { print?: boolean }) {
  if (!invoice.is_cumulative) {
    return null;
  }

  const rows: Array<{ key: string; label: string; value: string; tone?: "refund" | "extra" | "due" }> = [
    { key: "original", label: CUMULATIVE_LABELS.original, value: invoice.original_total_label },
  ];
  if ((invoice.totals.extra ?? 0) > 0) {
    rows.push({ key: "extra", label: CUMULATIVE_LABELS.extra, value: `+ ${invoice.extra_total_label}`, tone: "extra" });
  }
  if ((invoice.totals.refunded ?? 0) > 0) {
    rows.push({ key: "refunded", label: CUMULATIVE_LABELS.refunded, value: `- ${invoice.refunded_total_label}`, tone: "refund" });
  }
  if ((invoice.totals.outstanding ?? 0) > 0) {
    rows.push({
      key: "outstanding",
      label: CUMULATIVE_LABELS.outstanding,
      value: `${formatSar(invoice.totals.outstanding ?? 0)} ريال`,
      tone: "due",
    });
  }

  return (
    <div
      data-testid="invoice-cumulative"
      className={
        print
          ? "mt-4 overflow-hidden rounded-2xl border border-brand/30"
          : "mt-3 overflow-hidden rounded-2xl border border-[#ececec]"
      }
    >
      {rows.map((row) => (
        <div
          key={row.key}
          className="flex items-center justify-between gap-3 border-b border-[#f0f0f0] bg-white px-4 py-2.5 text-sm"
        >
          <span className="text-[#6f6f6f]">{row.label}</span>
          <span
            className={
              row.tone === "refund"
                ? "font-bold text-[#7c3aed]"
                : row.tone === "due"
                  ? "font-bold text-[#b45309]"
                  : "font-bold text-[#222222]"
            }
          >
            {row.value}
          </span>
        </div>
      ))}
      <div className="flex items-center justify-between gap-3 bg-brand-background-green/60 px-4 py-3">
        <span className="text-sm font-bold text-[#3f4d4a]">{CUMULATIVE_LABELS.net}</span>
        <span className={print ? "text-lg font-extrabold text-brand" : "text-sm font-extrabold text-brand"}>
          {invoice.net_total_label}
        </span>
      </div>
    </div>
  );
}

function transactionMeta(transaction: PaymentTransaction) {
  return [
    transaction.method_label,
    transaction.card_last4 ? `•••• ${transaction.card_last4}` : null,
    transaction.reference ? `${CUMULATIVE_LABELS.reference}: ${transaction.reference}` : null,
    transaction.reason,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** سجل الدفعات: كل حركة (أصلية / رسوم إضافية / فرق سعر / حوالة / استرجاع) بمبلغها وطريقتها وتاريخها. */
function InvoiceTransactions({ invoice, print = false }: InvoiceDocumentProps & { print?: boolean }) {
  if (invoice.transactions.length === 0) {
    return null;
  }

  return (
    <div data-testid="invoice-transactions" className={print ? "mt-6" : "mt-4"}>
      <p className="mb-2 text-sm font-extrabold text-[#222222]">{CUMULATIVE_LABELS.transactions}</p>
      <div className="overflow-hidden rounded-2xl border border-[#ececec]">
        {invoice.transactions.map((transaction, index) => {
          const negative = transaction.amount < 0 || transaction.kind === "refund";
          return (
            <div
              key={`${transaction.kind}-${transaction.id}`}
              className={
                index === 0
                  ? "flex flex-wrap items-start justify-between gap-2 px-4 py-3 text-sm"
                  : "flex flex-wrap items-start justify-between gap-2 border-t border-[#f0f0f0] px-4 py-3 text-sm"
              }
            >
              <div className="min-w-0 space-y-0.5">
                <p className="font-bold text-[#222222]">
                  {transaction.kind_label}
                  {transaction.status_label ? (
                    <span className="ms-2 rounded-full bg-[#f3f3f3] px-2 py-0.5 text-[11px] font-semibold text-[#555555]">
                      {transaction.status_label}
                    </span>
                  ) : null}
                </p>
                {transactionMeta(transaction) ? (
                  <p className="text-xs text-[#8a8a8a]">{transactionMeta(transaction)}</p>
                ) : null}
                {transaction.paid_at ? (
                  <p className="text-[11px] text-[#9a9a9a]" dir="ltr">
                    {formatTransactionDate(transaction.paid_at)}
                  </p>
                ) : null}
                {!print && transaction.receipt_url ? (
                  <a
                    href={transaction.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand underline-offset-2 hover:underline"
                  >
                    <ExternalLink className="size-3" aria-hidden="true" />
                    {CUMULATIVE_LABELS.receipt}
                  </a>
                ) : null}
              </div>
              <span className={negative ? "font-extrabold text-[#7c3aed]" : "font-extrabold text-[#222222]"}>
                {negative ? "- " : ""}
                {formatSar(Math.abs(transaction.amount))} ريال
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type RequestInvoiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: number;
  labels: RequestInvoiceDialogLabels;
};

type InvoiceDocumentProps = {
  invoice: ContractInvoice;
  labels: RequestInvoiceDialogLabels;
};

/** الإجمالي الفرعي / الخصم / الضريبة / الإجمالي — كلها من الخادم (ف1). */
function InvoiceTotals({
  invoice,
  labels,
  print = false,
}: InvoiceDocumentProps & { print?: boolean }) {
  const rows: Array<{ key: string; label: string; value: string; discount?: boolean }> = [];

  if (invoice.subtotal_label) {
    rows.push({ key: "subtotal", label: labels.subtotalLabel, value: invoice.subtotal_label });
  }
  if (invoice.discount && invoice.discount > 0 && invoice.discount_label) {
    rows.push({
      key: "discount",
      label: invoice.coupon_code
        ? `${labels.discountLabel} (${invoice.coupon_code})`
        : labels.discountLabel,
      value: `- ${invoice.discount_label}`,
      discount: true,
    });
  }
  if (invoice.vat_label) {
    rows.push({ key: "vat", label: labels.vatLabel, value: invoice.vat_label });
  }

  return (
    <div
      className={
        print
          ? "mt-5 overflow-hidden rounded-2xl border-2 border-brand"
          : "mt-3 overflow-hidden rounded-2xl border border-[#ececec]"
      }
    >
      {rows.map((row) => (
        <div
          key={row.key}
          className="flex items-center justify-between gap-3 border-b border-[#f0f0f0] bg-white px-4 py-2.5 text-sm"
        >
          <span className="text-[#6f6f6f]">{row.label}</span>
          <span
            className={
              row.discount ? "font-bold text-[#c0392b]" : "font-bold text-[#222222]"
            }
          >
            {row.value}
          </span>
        </div>
      ))}
      {invoice.total_due_label || invoice.total_amount_label ? (
        <div
          className={
            print
              ? "flex items-center justify-between gap-3 bg-brand-background-green/60 px-5 py-4"
              : "flex items-center justify-between gap-3 bg-[#f7f7f7] px-4 py-3"
          }
        >
          <span className="text-sm font-bold text-[#3f4d4a]">
            {invoice.total_due_label || labels.totalDueLabel}
          </span>
          <span className={print ? "text-xl font-extrabold text-brand" : "text-sm font-extrabold text-brand"}>
            {invoice.total_amount_label}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function InvoiceDocument({ invoice, labels }: InvoiceDocumentProps) {
  const statusColor = invoice.status_color || "#2f9e6f";

  return (
    <div className="rounded-[24px] border border-[#ececec] bg-white p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 text-start">
          {invoice.platform_name ? (
            <p className="text-xl font-extrabold text-brand">
              {invoice.platform_name}
            </p>
          ) : null}
          {invoice.platform_subtitle ? (
            <p className="mt-1 text-xs text-[#8a8a8a]">
              {invoice.platform_subtitle}
            </p>
          ) : null}
        </div>
        <div className="space-y-1 text-start text-xs text-[#8a8a8a] md:text-end">
          {invoice.invoice_number ? <p>{invoice.invoice_number}</p> : null}
          {invoice.datetime_label ? <p>{invoice.datetime_label}</p> : null}
          {invoice.reference_number ? (
            <p>{invoice.reference_number}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl bg-[#f7f7f7] px-4 py-3 sm:grid-cols-3">
        {invoice.customer_name ? (
          <div className="min-w-0 space-y-1 text-start">
            <p className="text-xs text-[#8a8a8a]">{labels.customerLabel}</p>
            <p className="truncate text-sm font-bold text-[#222222]">
              {invoice.customer_name}
            </p>
          </div>
        ) : null}
        <div className="min-w-0 space-y-1 text-start">
          <p className="text-xs text-[#8a8a8a]">
            {labels.requestNumberLabel}
          </p>
          <p className="text-sm font-bold text-[#222222]">
            {invoice.order_number}
          </p>
        </div>
        {invoice.contract_type_label ? (
          <div className="min-w-0 space-y-1 text-start">
            <p className="text-xs text-[#8a8a8a]">
              {labels.contractTypeLabel}
            </p>
            <p className="text-sm font-bold text-[#222222]">
              {invoice.contract_type_label}
            </p>
          </div>
        ) : null}
      </div>

      {invoice.items.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#ececec]">
          <div className="grid grid-cols-[48px_1fr_auto] gap-3 bg-brand px-4 py-2.5 text-xs font-bold text-white">
            <span>{labels.tableIndex}</span>
            <span>{labels.tableDescription}</span>
            <span>{labels.tableAmount}</span>
          </div>
          {invoice.items.map((item) => (
            <div
              key={`${item.index}-${item.description}`}
              className="grid grid-cols-[48px_1fr_auto] gap-3 border-t border-[#f0f0f0] px-4 py-3 text-sm first:border-t-0"
            >
              <span className="font-bold text-[#222222]">{item.index}</span>
              <span className="font-medium text-[#333333]">
                {item.description}
              </span>
              <span
                className={
                  item.is_discount ? "font-bold text-[#c0392b]" : "font-bold text-[#222222]"
                }
              >
                {item.amount_label}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <InvoiceTotals invoice={invoice} labels={labels} />
      <InvoiceCumulativeTotals invoice={invoice} labels={labels} />
      <InvoiceTransactions invoice={invoice} labels={labels} />

      {invoice.status_label || invoice.payment_state ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {invoice.status_label ? (
            <span
              className="inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-bold"
              style={{
                color: statusColor,
                borderColor: statusColor,
                backgroundColor: `${statusColor}14`,
              }}
            >
              {invoice.status_label}
            </span>
          ) : null}
          <PaymentStateChip state={invoice.payment_state} />
        </div>
      ) : null}
    </div>
  );
}

function InvoicePrintDocument({ invoice, labels }: InvoiceDocumentProps) {
  const statusColor = invoice.status_color || "#2f9e6f";

  return (
    <div className="relative mx-auto max-w-3xl overflow-hidden bg-white text-[#222222]">
      <div className="h-3 w-full bg-linear-to-r from-brand to-brand-secondary" />

      <Image
        src="/images/logo.png"
        alt=""
        width={480}
        height={480}
        priority
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 w-80 -translate-x-1/2 -translate-y-1/2 -rotate-12 object-contain opacity-[0.06] grayscale"
      />

      <div className="relative px-10 py-8">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-brand-background-green pb-6">
          <div className="flex min-w-0 items-center gap-3 text-start">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-background-green">
              <Image
                src="/images/logo.png"
                alt=""
                width={100}
                height={100}
                priority
                className="w-9 object-contain"
              />
            </div>
            <div className="min-w-0">
              {invoice.platform_name ? (
                <p className="text-2xl font-extrabold text-brand">
                  {invoice.platform_name}
                </p>
              ) : null}
              {invoice.platform_subtitle ? (
                <p className="mt-1 text-xs text-[#8a8a8a]">
                  {invoice.platform_subtitle}
                </p>
              ) : null}
            </div>
          </div>
          <div className="space-y-1.5 rounded-2xl bg-brand-background-green/60 px-4 py-3 text-end text-xs text-[#5c6b68]">
            {invoice.invoice_number ? (
              <p className="text-base font-extrabold text-brand">
                {invoice.invoice_number}
              </p>
            ) : null}
            {invoice.datetime_label ? <p>{invoice.datetime_label}</p> : null}
            {invoice.reference_number ? (
              <p>{invoice.reference_number}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          {invoice.customer_name ? (
            <div className="min-w-0 space-y-1 rounded-xl border-s-4 border-brand bg-[#f7f7f7] px-4 py-3 text-start">
              <p className="text-xs text-[#6f6f6f]">{labels.customerLabel}</p>
              <p className="truncate font-bold text-[#222222]">
                {invoice.customer_name}
              </p>
            </div>
          ) : null}
          <div className="min-w-0 space-y-1 rounded-xl border-s-4 border-brand bg-[#f7f7f7] px-4 py-3 text-start">
            <p className="text-xs text-[#6f6f6f]">
              {labels.requestNumberLabel}
            </p>
            <p className="truncate font-bold text-[#222222]">
              {invoice.order_number}
            </p>
          </div>
          {invoice.contract_type_label ? (
            <div className="min-w-0 space-y-1 rounded-xl border-s-4 border-brand bg-[#f7f7f7] px-4 py-3 text-start">
              <p className="text-xs text-[#6f6f6f]">
                {labels.contractTypeLabel}
              </p>
              <p className="truncate font-bold text-[#222222]">
                {invoice.contract_type_label}
              </p>
            </div>
          ) : null}
        </div>

        {invoice.items.length > 0 ? (
          <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse overflow-hidden rounded-2xl text-sm">
            <thead>
              <tr className="bg-brand text-xs font-bold tracking-wide text-white uppercase">
                <th className="rounded-s-xl py-3 ps-4 pe-3 text-start">
                  {labels.tableIndex}
                </th>
                <th className="py-3 pe-3 text-start">
                  {labels.tableDescription}
                </th>
                <th className="rounded-e-xl py-3 ps-3 pe-4 text-end">
                  {labels.tableAmount}
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, itemIndex) => (
                <tr
                  key={`${item.index}-${item.description}`}
                  className={
                    itemIndex % 2 === 0 ? "bg-white" : "bg-brand-background"
                  }
                >
                  <td className="py-3 ps-4 pe-3 align-top font-bold text-brand-secondary">
                    {item.index}
                  </td>
                  <td className="py-3 pe-3 align-top text-[#333333]">
                    {item.description}
                  </td>
                  <td
                    className={
                      item.is_discount
                        ? "py-3 ps-3 pe-4 text-end align-top font-bold text-[#c0392b]"
                        : "py-3 ps-3 pe-4 text-end align-top font-bold text-[#222222]"
                    }
                  >
                    {item.amount_label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : null}

        <InvoiceTotals invoice={invoice} labels={labels} print />
        <InvoiceCumulativeTotals invoice={invoice} labels={labels} print />
        <InvoiceTransactions invoice={invoice} labels={labels} print />

        {invoice.status_label ? (
          <div className="mt-6 flex justify-center">
            <span
              className="inline-flex items-center rounded-full border-2 px-5 py-1.5 text-sm font-bold"
              style={{
                color: statusColor,
                borderColor: statusColor,
                backgroundColor: `${statusColor}14`,
              }}
            >
              {invoice.status_label}
            </span>
          </div>
        ) : null}

        <div className="mt-10 border-t border-[#ececec] pt-4 text-center text-[11px] text-[#9a9a9a]">
          {invoice.platform_name}
        </div>
      </div>

      <div className="h-3 w-full bg-linear-to-r from-brand to-brand-secondary" />
    </div>
  );
}

export default function RequestInvoiceDialog({
  open,
  onOpenChange,
  contractId,
  labels,
}: RequestInvoiceDialogProps) {
  const [isLoading, setIsLoading] = useState(open);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<ContractInvoice | null>(null);
  const [wasOpen, setWasOpen] = useState(open);

  // Reset to a loading state during render when the dialog opens, so the
  // fetch effect below only sets state after the request resolves.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      resetToLoading();
    }
  }

  function resetToLoading() {
    setIsLoading(true);
    setError(null);
    setInvoice(null);
  }

  // Bumped by the retry button to re-run the fetch effect.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    // ف1: الفاتورة (البنود + الإجماليات) من الخادم فقط.
    getContractInvoice({ contractId })
      .then((result) => {
        if (cancelled) {
          return;
        }

        if (!result.ok) {
          setError(result.error || labels.loadError);
          setInvoice(null);
          return;
        }

        setInvoice(result.data);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) {
          setError(labels.loadError);
          setInvoice(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, attempt, contractId, labels.loadError]);

  function handlePrint() {
    if (!invoice) {
      return;
    }

    // Print in place instead of opening a popup window: popups opened via
    // window.open() are routinely blocked (browser/extension popup
    // blockers), which was surfacing as a silent failure. Printing the
    // current document also means the real compiled Tailwind stylesheet is
    // already loaded — no need to hand-carry styles into a new document.
    window.print();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="scrollbar-hide max-h-[min(90vh,820px)] gap-0 overflow-y-auto rounded-[28px] border-0 p-5 sm:max-w-xl md:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#ececec] pb-4">
          <DialogTitle className="text-lg font-extrabold text-[#222222] md:text-xl">
            {invoice?.title || labels.title}
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label={labels.close}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f3f3f3] text-[#666666] transition-colors hover:bg-[#ebebeb]"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {isLoading && !invoice ? (
          <p className="rounded-2xl bg-[#f7f7f7] px-4 py-10 text-center text-sm font-medium text-[#8a8a8a]">
            {labels.loading}
          </p>
        ) : null}

        {error && !invoice ? (
          <div className="space-y-3 rounded-2xl bg-[#fff5f5] px-4 py-5 text-center">
            <p className="text-sm text-[#c0392b]">{error}</p>
            <button
              type="button"
              onClick={() => {
                resetToLoading();
                setAttempt((current) => current + 1);
              }}
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-brand px-4 text-sm font-bold text-white"
            >
              {labels.retry}
            </button>
          </div>
        ) : null}

        {invoice ? (
          <>
            <InvoiceDocument invoice={invoice} labels={labels} />

            {invoice.print_label ? (
              <button
                type="button"
                onClick={handlePrint}
                className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-background-green px-4 text-sm font-bold text-brand transition-opacity hover:opacity-90"
              >
                <Printer className="size-4 shrink-0" aria-hidden="true" />
                {invoice.print_label}
              </button>
            ) : null}

            {invoice.invoice_url ? (
              <a
                href={invoice.invoice_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#e8e8e8] bg-white px-4 text-sm font-bold text-[#555555] transition-colors hover:bg-[#fafafa]"
              >
                <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
                {CUMULATIVE_LABELS.serverInvoice}
              </a>
            ) : null}
          </>
        ) : null}
      </DialogContent>

      {invoice && typeof document !== "undefined"
        ? createPortal(
            <div id="print-area" className="hidden print:block">
              <InvoicePrintDocument invoice={invoice} labels={labels} />
            </div>,
            document.body,
          )
        : null}
    </Dialog>
  );
}
