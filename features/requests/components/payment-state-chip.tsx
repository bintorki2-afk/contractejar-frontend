import { Banknote, CheckCircle2, Clock, RotateCcw } from "lucide-react";

import type { PaymentState } from "@/features/requests/types/payment-state";
import { paymentChipTone } from "@/features/requests/utils/normalize-payment-state";
import { cn } from "@/lib/utils";

type PaymentStateChipProps = {
  state: PaymentState | null | undefined;
  /** Compact: status only («مدفوع»); default: the server label («مدفوع · Moyasar · 279 ر.س»). */
  compact?: boolean;
  className?: string;
};

/**
 * دفعة هـ (E2/E5): شريحة حالة الدفع بخمس حالات — غير مدفوع / مدفوع (Moyasar أو
 * حوالة) / مدفوع جزئياً / مسترجع جزئياً / مسترجع. النص من الخادم كما هو.
 */
export default function PaymentStateChip({ state, compact = false, className }: PaymentStateChipProps) {
  if (!state) {
    return null;
  }

  const tone = paymentChipTone(state.status);
  const Icon =
    tone === "success"
      ? state.method === "bank_transfer"
        ? Banknote
        : CheckCircle2
      : tone === "refund"
        ? RotateCcw
        : Clock;

  return (
    <span
      data-testid="payment-state-chip"
      data-status={state.status}
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
        tone === "success" && "bg-brand-background-green text-brand dark:bg-[#12302a] dark:text-[#48c0b8]",
        tone === "warning" && "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
        tone === "refund" && "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
        tone === "neutral" && "bg-[#f3f3f3] text-[#555555] dark:bg-[#24302c] dark:text-[#9eb5af]",
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{compact ? state.status_label : state.label}</span>
    </span>
  );
}
