"use client";

import { Clock3, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import WhatsappCtaLink from "@/features/analytics/components/whatsapp-cta-link";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import RequestCompletePaymentButton from "@/features/requests/components/request-complete-payment-button";
import OrderNotificationsList from "@/features/notifications/components/order-notifications-list";
import OrderJourneySteps from "@/features/requests/components/order-journey-steps";
import RefundBanner from "@/features/requests/components/refund-banner";
import type { ContractPaymentMethodLabels } from "@/features/create-contract/hooks/use-contract-payment-method-flow";
import { buildTemplateJourney } from "@/features/requests/data/order-journey";
import { useContractJourney } from "@/features/requests/hooks/use-contract-journey";
import type { RequestActionType } from "@/features/requests/types/request";

export type RequestReceiveContractDialogLabels = {
  title: string;
  subtitle: string;
  close: string;
  loading: string;
  retry: string;
  draftBadge: string;
  statusUpdatedToast: string;
  expectedDurationTitle: string;
  expectedDurationBody: string;
  contactPrompt: string;
  whatsappCta: string;
  whatsappHref: string;
};

type RequestReceiveContractDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: number;
  contractUuid: string;
  actionType: RequestActionType;
  completePaymentLabel: string;
  completePaymentWithAmountLabel: string;
  completePaymentLoadingLabel: string;
  paymentFlowLabels: ContractPaymentMethodLabels;
  labels: RequestReceiveContractDialogLabels;
};

export default function RequestReceiveContractDialog({
  open,
  onOpenChange,
  contractId,
  contractUuid,
  actionType,
  completePaymentLabel,
  completePaymentWithAmountLabel,
  completePaymentLoadingLabel,
  paymentFlowLabels,
  labels,
}: RequestReceiveContractDialogProps) {
  const { detail, loading, error, reload } = useContractJourney({
    contractId,
    enabled: open,
  });

  const showPayButton = actionType === "complete-payment" && !detail?.refund?.refunded;
  // رقم الطلب الظاهر للعميل هو الـ uuid (6 أرقام) وليس المعرّف الداخلي.
  const requestId = detail?.uuid || contractUuid || String(contractId);
  const subtitle = labels.subtitle.replace("{number}", String(requestId));
  const badgeLabel =
    detail?.journey_status_label || detail?.status_label || null;
  // الخادم يعيد الرحلة الست (ف2)؛ عند غيابها نعرض القالب بحالة مشتقة من
  // الدفع فقط (مدفوع ← الخطوتان الأوليان منجزتان).
  const journey =
    detail?.journey && detail.journey.length > 0
      ? detail.journey.map((step) => ({
          key: step.key,
          label: step.status_label,
          description: step.description,
          state: step.state,
          at: step.at ?? null,
        }))
      : detail
        ? buildTemplateJourney(detail.is_completed ? 2 : 1)
        : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="scrollbar-hide max-h-[min(90vh,760px)] gap-0 overflow-y-auto rounded-[28px] border-0 p-5 sm:max-w-lg md:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2 text-start">
            <DialogTitle className="text-lg font-extrabold text-[#222222] md:text-xl">
              {labels.title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-[#8a8a8a]">
              {subtitle}
            </DialogDescription>

            {badgeLabel ? (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white"
                  style={{
                    backgroundColor: detail?.status_color || "#3b82f6",
                  }}
                >
                  {badgeLabel}
                </span>
                {detail?.status_type === "draft" ? (
                  <span className="inline-flex items-center rounded-full bg-[#fff1e6] px-3 py-1 text-xs font-bold text-[#e67e22]">
                    {labels.draftBadge}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label={labels.close}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f3f3f3] text-[#666666] transition-colors hover:bg-[#ebebeb]"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {loading && !detail ? (
          <p className="py-10 text-center text-sm text-[#8a8a8a]">
            {labels.loading}
          </p>
        ) : null}

        {error && !detail ? (
          <div className="space-y-3 rounded-2xl bg-[#fff5f5] px-4 py-5 text-center">
            <p className="text-sm text-[#c0392b]">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-brand px-4 text-sm font-bold text-white"
            >
              {labels.retry}
            </button>
          </div>
        ) : null}

        {detail?.refund ? (
          <div className="mb-4">
            <RefundBanner info={detail.refund} />
          </div>
        ) : null}

        {journey.length > 0 && !detail?.refund?.refunded ? (
          <OrderJourneySteps steps={journey} showSentence />
        ) : null}

        {detail ? (
          <div className="mt-5">
            <OrderNotificationsList orderNumber={String(requestId)} />
          </div>
        ) : null}

        {!loading && detail && journey.length === 0 && !error ? (
          <p className="py-6 text-center text-sm text-[#8a8a8a]">
            {detail.status_label}
          </p>
        ) : null}

        <div className="mt-5 rounded-2xl bg-[#f7f7f7] px-4 py-3.5">
          <div className="mb-1.5 flex items-center gap-2">
            <Clock3 className="size-4 text-brand" aria-hidden="true" />
            <p className="text-sm font-extrabold text-brand">
              {labels.expectedDurationTitle}
            </p>
          </div>
          <p className="text-xs leading-6 text-[#6f6f6f]">
            {labels.expectedDurationBody}
          </p>
        </div>

        <p className="mt-5 text-center text-sm font-semibold text-[#555555]">
          {labels.contactPrompt}
        </p>

        <div className="mt-3 space-y-2.5">
          {showPayButton ? (
            <RequestCompletePaymentButton
              contractId={contractId}
              contractUuid={contractUuid}
              label={completePaymentLabel}
              labelWithAmount={completePaymentWithAmountLabel}
              payingLabel={completePaymentLoadingLabel}
              paymentFlowLabels={paymentFlowLabels}
              className="h-12 w-full rounded-2xl"
            />
          ) : null}

          <WhatsappCtaLink
            placement="order_detail"
            href={labels.whatsappHref}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            <FaWhatsapp className="size-5 shrink-0" aria-hidden="true" />
            {labels.whatsappCta}
          </WhatsappCtaLink>
        </div>
      </DialogContent>
    </Dialog>
  );
}
