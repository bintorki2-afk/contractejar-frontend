import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

import RequestCompletePaymentButton from "@/features/requests/components/request-complete-payment-button";
import RequestInvoiceButton from "@/features/requests/components/request-invoice-button";
import RequestReceiveContractButton from "@/features/requests/components/request-receive-contract-button";
import RequestViewContractButton from "@/features/requests/components/request-view-contract-button";
import RequestViewDataButton from "@/features/requests/components/request-view-data-button";
import type { RequestCardData } from "@/features/requests/types/request";
import type { RequestCardLabels } from "@/features/requests/types/request-labels";
import { cn } from "@/lib/utils";

type RequestCardActionsProps = {
  card: Pick<
    RequestCardData,
    | "actionType"
    | "uuid"
    | "contractId"
    | "contractType"
    | "requestNumber"
    | "showDownloadInvoice"
    | "showViewEdit"
  >;
  labels: RequestCardLabels;
  isIncompleteDraft: boolean;
};

export default function RequestCardActions({
  card,
  labels,
  isIncompleteDraft = false,
}: RequestCardActionsProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-end gap-2 border-[#f0f0f0] pt-4 dark:border-[#262d2c]", isIncompleteDraft ? "" : " border-t")}>
      {/* RTL visual (right → left): WhatsApp, View, Invoice?, When, Pay? */}
      <Link
        href={labels.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={labels.whatsappLabel}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8f8ee] text-[#25D366] transition-opacity hover:opacity-90 dark:bg-[#00a880] dark:text-white"
      >
        <FaWhatsapp className="size-5" aria-hidden="true" />
      </Link>

      {card.showViewEdit ? (
        <RequestViewDataButton
          uuid={card.uuid}
          requestNumber={card.requestNumber}
          label={labels.viewData}
          loadErrorLabel={labels.editError}
          detailsLabels={labels.detailsDialog}
        />
      ) : (
        <RequestViewContractButton
          contractId={card.contractId}
          uuid={card.uuid}
          requestNumber={card.requestNumber}
          label={labels.viewData}
          loadErrorLabel={labels.editError}
          detailsLabels={labels.contractDialog}
        />
      )}

      {card.showDownloadInvoice ? (
        <RequestInvoiceButton
          label={labels.downloadInvoice}
          contractId={card.contractId}
          invoiceLabels={labels.invoiceDialog}
        />
      ) : null}

      <RequestReceiveContractButton
        label={labels.whenReceiveContract}
        actionType={card.actionType}
        contractId={card.contractId}
        contractUuid={card.uuid}
        contractType={card.contractType}
        completePaymentLabel={labels.completePayment}
        completePaymentWithAmountLabel={labels.completePaymentWithAmount}
        completePaymentLoadingLabel={labels.completePaymentLoading}
        paymentFlowLabels={labels.paymentFlow}
        dialogLabels={labels.receiveContractDialog}
      />

      {card.actionType === "complete-payment" ? (
        <RequestCompletePaymentButton
          contractId={card.contractId}
          contractUuid={card.uuid}
          label={labels.completePayment}
          labelWithAmount={labels.completePaymentWithAmount}
          payingLabel={labels.completePaymentLoading}
          paymentFlowLabels={labels.paymentFlow}
        />
      ) : null}
    </div>
  );
}
