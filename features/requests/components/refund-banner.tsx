import { RotateCcw } from "lucide-react";

import { formatRefundLabel, type RefundInfo } from "@/features/requests/utils/resolve-refund";

/**
 * «تم الاسترجاع» (كامل) أو «استرجاع جزئي» مع المبلغ — يظهر في التتبّع وتفاصيل الطلب.
 */
export default function RefundBanner({ info }: { info: RefundInfo }) {
  if (!info.refunded && !info.partial) {
    return null;
  }

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4 text-violet-900 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-200"
    >
      <RotateCcw className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-sm font-extrabold">{formatRefundLabel(info)}</p>
        <p className="text-xs leading-6 opacity-90">
          {info.refunded
            ? info.amount != null
              ? "أُعيد المبلغ إلى وسيلة الدفع نفسها، وقد يستغرق ظهوره في حسابك بضعة أيام عمل حسب البنك."
              : "اعتُمد استرجاع طلبك، ويُعاد المبلغ إلى وسيلة الدفع نفسها وقد يستغرق ظهوره في حسابك بضعة أيام عمل حسب البنك."
            : "أُعيد جزء من المبلغ إلى وسيلة الدفع نفسها، وطلبك مستمر كالمعتاد."}
        </p>
      </div>
    </div>
  );
}
