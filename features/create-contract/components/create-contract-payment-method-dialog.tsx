"use client";

import {
  ChevronLeft,
  ClipboardList,
  CreditCard,
  X,
  Zap,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import { formatPaymentAmount } from "@/features/create-contract/types/payment-step";
import { cn } from "@/lib/utils";

type PaymentMethod = "draft" | "pay-now";

type CreateContractPaymentMethodDialogProps = {
  labels: CreateContractLabels["payment"]["methodDialog"];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting?: boolean;
  hasDiscount?: boolean;
  totalPrice?: number;
  discountedPrice?: number | null;
  selectedMethod?: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void | Promise<void>;
  /** Shown under "pay first" when that option is selected. */
  payNowExtra?: ReactNode;
};

function isPaymentStep(step: string) {
  const normalized = step.trim().toLowerCase();
  return (
    normalized === "الدفع" ||
    normalized === "payment" ||
    normalized.includes("دفع") ||
    normalized.includes("pay")
  );
}

function FlowSteps({ steps }: { steps: string[] }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      {steps.map((step, i) => {
        const highlighted = isPaymentStep(step);

        return (
          <span key={`${step}-${i}`} className="flex items-center gap-1.5">
            <span
              className={cn(
                "rounded-lg border px-2 py-1 text-[10px] font-bold leading-none sm:text-[11px]",
                highlighted
                  ? "border-brand/40 bg-[#e8f5ee] text-brand dark:border-[#2f403b] dark:bg-[#16352f] dark:text-[#48c0b8]"
                  : "border-[#e0e0e0] bg-white text-[#555] dark:border-[#2f403b] dark:bg-[#121a18] dark:text-[#9eb5af]",
              )}
            >
              {step}
            </span>
            {i < steps.length - 1 ? (
              <ChevronLeft
                className="size-3 shrink-0 text-[#c4c4c4] dark:text-[#5c6b68]"
                aria-hidden="true"
              />
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

function RadioIndicator({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
        selected
          ? "border-brand dark:border-[#48c0b8]"
          : "border-[#cfcfcf] dark:border-[#5c6b68]",
      )}
    >
      {selected ? (
        <span className="size-2.5 rounded-full bg-brand dark:bg-[#48c0b8]" />
      ) : null}
    </span>
  );
}

function MethodPrice({
  label,
  amount,
  currency,
  originalAmount,
}: {
  label: string;
  amount: number;
  currency: string;
  originalAmount?: number | null;
}) {
  return (
    <div className="mt-3 flex items-end justify-between gap-3 border-t border-dashed border-[#d9d9d9] pt-3 dark:border-[#2f403b]">
      <span className="text-xs font-bold text-[#666] dark:text-[#9eb5af]">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        {typeof originalAmount === "number" && originalAmount > amount ? (
          <span className="text-xs text-[#9a9a9a] line-through dark:text-[#6b7d78]">
            {formatPaymentAmount(originalAmount)}
          </span>
        ) : null}
        <span className="text-base font-extrabold text-brand dark:text-[#48c0b8]">
          {formatPaymentAmount(amount)} {currency}
        </span>
      </div>
    </div>
  );
}

export default function CreateContractPaymentMethodDialog({
  labels,
  open,
  onOpenChange,
  isSubmitting = false,
  hasDiscount = false,
  totalPrice = 0,
  discountedPrice = null,
  selectedMethod = null,
  onSelect,
  payNowExtra,
}: CreateContractPaymentMethodDialogProps) {
  const [pendingMethod, setPendingMethod] = useState<PaymentMethod | null>(
    selectedMethod,
  );
  const [syncedProps, setSyncedProps] = useState({ open, selectedMethod });

  if (
    syncedProps.open !== open ||
    syncedProps.selectedMethod !== selectedMethod
  ) {
    setSyncedProps({ open, selectedMethod });
    if (open) {
      setPendingMethod(selectedMethod);
    }
  }

  const showPayNowCoupon = Boolean(payNowExtra);
  const isPayNowPending = pendingMethod === "pay-now";
  const payNowAmount =
    hasDiscount && typeof discountedPrice === "number"
      ? discountedPrice
      : totalPrice;

  async function handleSelect(method: PaymentMethod) {
    if (isSubmitting) {
      return;
    }

    if (method === "pay-now" && showPayNowCoupon) {
      setPendingMethod("pay-now");
      return;
    }

    setPendingMethod(method);
    await onSelect(method);
  }

  async function handleConfirmPayNow() {
    if (isSubmitting) {
      return;
    }

    setPendingMethod("pay-now");
    await onSelect("pay-now");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="scrollbar-hide max-h-[min(92vh,900px)] gap-0 overflow-y-auto rounded-[28px] border-0 bg-white p-5 sm:max-w-lg dark:bg-[#1a2421] dark:text-white"
      >
        <div className="relative mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 text-start">
            <DialogTitle className="text-base font-extrabold text-[#1a1a1a] md:text-lg dark:text-white">
              {labels.title}
            </DialogTitle>
            <p className="mt-1 text-xs leading-relaxed text-[#7f7f7f] dark:text-[#9eb5af]">
              {labels.subtitle}
            </p>
          </div>

          <DialogClose asChild>
            <button
              type="button"
              aria-label={labels.close}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f2f2f2] text-[#8a8a8a] transition-colors hover:bg-[#ebebeb] hover:text-[#555] dark:bg-[#121a18] dark:text-[#9eb5af] dark:hover:bg-[#24302c] dark:hover:text-white"
            >
              <X className="size-4" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </DialogClose>
        </div>

        <div className="space-y-3">
          <div className="space-y-3">
            <button
              type="button"
              disabled={isSubmitting}
              aria-pressed={pendingMethod === "pay-now"}
              onClick={() => void handleSelect("pay-now")}
              className={cn(
                "w-full rounded-[22px] border-2 px-3.5 py-3.5 text-start transition-colors",
                pendingMethod === "pay-now"
                  ? "border-brand bg-[#f7fcf9] dark:border-[#48c0b8] dark:bg-[#16352f]"
                  : "border-[#e8e8e8] bg-white hover:border-[#d5d5d5] dark:border-[#2f403b] dark:bg-[#121a18] dark:hover:border-[#3d524c]",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#e0e0e0] bg-white text-brand dark:border-[#2f403b] dark:bg-[#1a2421] dark:text-[#48c0b8]">
                  <CreditCard className="size-5" aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                    {hasDiscount ? (
                      <span className="inline-flex items-center rounded-full bg-[#ffe8d6] px-2 py-0.5 text-[11px] font-extrabold text-[#b45f1a] dark:bg-[#3a2a1a] dark:text-[#cca352]">
                        {labels.payNow.discountBadge}
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[11px] font-extrabold text-white dark:bg-[#0f6b5c]">
                      <Zap className="size-3" aria-hidden="true" />
                      {labels.payNow.badge}
                    </span>
                  </div>

                  <p className="text-sm font-extrabold leading-snug text-[#1a1a1a] dark:text-white">
                    {labels.payNow.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[#7f7f7f] dark:text-[#9eb5af]">
                    {labels.payNow.description}
                  </p>

                  <FlowSteps steps={labels.payNow.steps} />

                  {labels.payNow.note ? (
                    <p className="mt-3 rounded-xl bg-[#e8f5ee] px-3 py-2 text-[11px] leading-relaxed text-[#2a6644] dark:bg-[#0f2a24] dark:text-[#9eb5af]">
                      {labels.payNow.note}
                    </p>
                  ) : null}

                  {totalPrice > 0 ? (
                    <MethodPrice
                      label={
                        hasDiscount ? labels.afterDiscount : labels.total
                      }
                      amount={payNowAmount}
                      currency={labels.currency}
                      originalAmount={hasDiscount ? totalPrice : null}
                    />
                  ) : null}
                </div>

                <RadioIndicator selected={pendingMethod === "pay-now"} />
              </div>
            </button>

            {isPayNowPending && payNowExtra ? (
              <div className="rounded-[22px] border border-brand/20 bg-[#f7fcf9] p-3 dark:border-[#2f403b] dark:bg-[#16352f]">
                {payNowExtra}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            aria-pressed={pendingMethod === "draft"}
            onClick={() => void handleSelect("draft")}
            className={cn(
              "w-full rounded-[22px] border-2 px-3.5 py-3.5 text-start transition-colors",
              pendingMethod === "draft"
                ? "border-brand bg-[#f7fcf9] dark:border-[#48c0b8] dark:bg-[#16352f]"
                : "border-[#e8e8e8] bg-white hover:border-[#d5d5d5] dark:border-[#2f403b] dark:bg-[#121a18] dark:hover:border-[#3d524c]",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#e0e0e0] bg-white text-brand dark:border-[#2f403b] dark:bg-[#1a2421] dark:text-[#48c0b8]">
                <ClipboardList className="size-5" aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold leading-snug text-[#1a1a1a] dark:text-white">
                  {labels.draft.title}
                </p>
                <p className="mt-0.5 text-xs text-[#7f7f7f] dark:text-[#9eb5af]">
                  {labels.draft.description}
                </p>

                <FlowSteps steps={labels.draft.steps} />

                {labels.draft.note ? (
                  <p className="mt-3 text-[11px] leading-relaxed text-[#5a6a64] dark:text-[#9eb5af]">
                    {labels.draft.note}
                  </p>
                ) : null}

                {totalPrice > 0 ? (
                  <MethodPrice
                    label={labels.total}
                    amount={totalPrice}
                    currency={labels.currency}
                  />
                ) : null}
              </div>

              <RadioIndicator selected={pendingMethod === "draft"} />
            </div>
          </button>
        </div>

        {isPayNowPending && showPayNowCoupon ? (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => void handleConfirmPayNow()}
            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-brand px-4 text-sm font-extrabold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#0f6b5c]"
          >
            {labels.confirmPayNow}
          </button>
        ) : null}

        <div className="mt-4 rounded-2xl bg-[#eef8f3] px-4 py-3 text-[11px] leading-relaxed text-[#35584a] dark:bg-[#0f2a24] dark:text-[#9eb5af]">
          <span className="font-extrabold dark:text-[#48c0b8]">
            {labels.footerNoteTitle}
          </span>{" "}
          <span>{labels.footerNote}</span>
        </div>

        {isSubmitting ? (
          <p className="mt-3 text-center text-xs text-[#7f7f7f] dark:text-[#9eb5af]">
            {labels.submitting}
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export type { PaymentMethod };
