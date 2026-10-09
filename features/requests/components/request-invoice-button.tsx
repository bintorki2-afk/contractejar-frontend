"use client";

import { Download } from "lucide-react";
import { useState } from "react";

import RequestInvoiceDialog from "@/features/requests/components/request-invoice-dialog";
import type { ContractInvoice } from "@/features/requests/types/contract-invoice";
import type { RequestInvoiceDialogLabels } from "@/features/requests/types/request-invoice-labels";
import { cn } from "@/lib/utils";

type RequestInvoiceButtonProps = {
  label: string;
  contractId: number;
  invoiceLabels: RequestInvoiceDialogLabels;
  /** دفعة هـ (W-2): فاتورة جاهزة من رد الخادم (صفحة التتبّع) — بلا جلب إضافي. */
  invoice?: ContractInvoice | null;
  className?: string;
  "data-testid"?: string;
};

export default function RequestInvoiceButton({
  label,
  contractId,
  invoiceLabels,
  invoice = null,
  className,
  "data-testid": testId,
}: RequestInvoiceButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        data-testid={testId}
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#e8e8e8] bg-white px-4 text-sm font-bold text-brand transition-colors hover:bg-[#fafafa] dark:border-[#262d2c] dark:bg-[#151c1b] dark:text-white dark:hover:bg-[#1a2221]",
          className,
        )}
      >
        <Download className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </button>

      <RequestInvoiceDialog
        open={open}
        onOpenChange={setOpen}
        contractId={contractId}
        labels={invoiceLabels}
        invoice={invoice}
      />
    </>
  );
}
