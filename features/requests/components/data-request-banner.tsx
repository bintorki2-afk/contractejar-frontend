import { AlertTriangle, ArrowUpLeft } from "lucide-react";
import Link from "next/link";

import type { PendingDataRequest } from "@/features/requests/types/payment-state";
import { cn } from "@/lib/utils";

/** `/create-contract?id=…&fix=…&order=…&step=…` — وضع التصحيح في المعالج (W1d). */
export function buildFixHref(input: {
  orderUuid: string;
  contractType: "residential" | "commercial" | "housing" | string | null | undefined;
  requestId: number;
  step: number | null | undefined;
}): string {
  const type = input.contractType === "commercial" ? "commercial" : "residential";
  const params = new URLSearchParams({
    id: type,
    fix: String(input.requestId),
    order: String(input.orderUuid),
  });
  if (input.step != null && Number.isFinite(input.step)) {
    params.set("step", String(Math.trunc(input.step)));
  }
  return `/create-contract?${params.toString()}`;
}

type DataRequestBannerProps = {
  orderUuid: string;
  contractType: string | null | undefined;
  requests: PendingDataRequest[];
  /** `?fix=<id>` from the smart link / push: that request is emphasised. */
  highlightId?: number | null;
  className?: string;
};

/**
 * دفعة هـ (E4): «مطلوب منك: <البنود> — <الملاحظة>» لكل طلب مرفق ناقص مفتوح،
 * مع زر يفتح المعالج على الخطوة المطلوبة فقط (وضع التصحيح).
 */
export default function DataRequestBanner({
  orderUuid,
  contractType,
  requests,
  highlightId = null,
  className,
}: DataRequestBannerProps) {
  if (requests.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)} data-testid="data-request-banners">
      {requests.map((request) => {
        const highlighted = highlightId != null && highlightId === request.id;
        return (
          <div
            key={request.id}
            id={`data-request-${request.id}`}
            data-testid={`data-request-${request.id}`}
            className={cn(
              "rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30",
              highlighted && "ring-2 ring-amber-400 ring-offset-2 ring-offset-white dark:ring-offset-[#1a2421]",
            )}
            role="alert"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-extrabold leading-relaxed text-amber-900 dark:text-amber-200">
                  {request.banner}
                </p>
                {request.section_label ? (
                  <p className="text-xs text-amber-800/90 dark:text-amber-300">
                    القسم: {request.section_label}
                    {request.step ? ` · الخطوة ${request.step}` : ""}
                  </p>
                ) : null}
              </div>
            </div>

            <Link
              href={buildFixHref({
                orderUuid,
                contractType,
                requestId: request.id,
                step: request.step,
              })}
              className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-amber-600 text-sm font-bold text-white transition hover:bg-amber-700"
              data-testid={`data-request-fix-${request.id}`}
            >
              أرسل المطلوب الآن
              <ArrowUpLeft className="size-4" aria-hidden="true" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
