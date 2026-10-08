"use client";

import { Printer, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { getContractInvoice } from "@/features/requests/services/get-contract-invoice";
import type { ContractInvoice } from "@/features/requests/types/contract-invoice";
import type { RequestInvoiceDialogLabels } from "@/features/requests/types/request-invoice-labels";

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

      {invoice.status_label ? (
        <div className="mt-4 flex justify-center">
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
