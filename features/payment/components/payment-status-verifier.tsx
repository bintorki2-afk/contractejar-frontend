"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import { resetCreateContractDraft } from "@/features/create-contract/utils/reset-create-contract-draft";
import PaymentStatusContent from "@/features/payment/components/payment-status-content";
import {
  resolvePaymentStatusUi,
  type PaymentStatusUiState,
} from "@/features/payment/utils/resolve-payment-status-ui";
import type { PaymentContentItem } from "@/features/payment/types/payment-content";
import { trackPurchaseOnce } from "@/lib/analytics/track";
import { getPaymentStatusPayload } from "@/features/payment/services/get-payment-status-payload";

type PaymentStatusVerifierLabels = {
  backLabel: string;
  successPageTitle: string;
  successTitle: string;
  successDescription: string;
  errorPageTitle: string;
  errorTitle: string;
  errorDescription: string;
  contractNumberLabel: string;
  contractTypeLabel: string;
  paidAmountLabel: string;
  housingContractTypeLabel: string;
  commercialContractTypeLabel: string;
  lessorChangeTypeLabel: string;
  backToRequestsLabel: string;
  backToHomeLabel: string;
  retryPaymentLabel: string;
  retryPaymentLoadingLabel: string;
  retryPaymentErrorLabel: string;
  checkingTitle: string;
  checkingDescription: string;
  completedMessage: string;
  failedMessage: string;
  successHeadline: string;
  successNextStep: string;
  successNextStepLessorChange: string;
  journeyTitle: string;
  trackOrderLabel: string;
  whatsappSupportLabel: string;
  whatsappSupportMessage: string;
};

type PaymentStatusVerifierProps = {
  contractUuid: string;
  status: "success" | "error";
  labels: PaymentStatusVerifierLabels;
  paymentContent?: PaymentContentItem | null;
};

type VerificationState =
  | { state: "loading" }
  | ({ state: "resolved" } & PaymentStatusUiState);

export default function PaymentStatusVerifier({
  contractUuid,
  status,
  labels,
  paymentContent = null,
}: PaymentStatusVerifierProps) {
  const router = useRouter();
  const [verification, setVerification] = useState<VerificationState>({
    state: "loading",
  });

  useEffect(() => {
    let isMounted = true;

    async function verify() {
      setVerification({ state: "loading" });

      try {
        const searchParams = new URLSearchParams(window.location.search);
        const verificationParams = new URLSearchParams();

        const id = searchParams.get("id");
        const invoiceId = searchParams.get("invoice_id");
        const paymentStatus = searchParams.get("status");

        if (id) {
          verificationParams.set("id", id);
        }

        if (invoiceId) {
          verificationParams.set("invoice_id", invoiceId);
        }

        if (paymentStatus) {
          verificationParams.set("status", paymentStatus);
        }

        // Through the website server with the session token (the API hides
        // contract/payment details from anonymous callers).
        const payload = (await getPaymentStatusPayload(status, contractUuid, {
          id: verificationParams.get("id"),
          invoice_id: verificationParams.get("invoice_id"),
          status: verificationParams.get("status"),
        })) as Parameters<typeof resolvePaymentStatusUi>[0];

        if (process.env.NODE_ENV !== "production") {
          console.log("[payment-status]", contractUuid, payload);
        }

        if (!isMounted) {
          return;
        }

        const outcome = resolvePaymentStatusUi(payload, {
          completedMessage: labels.completedMessage,
          failedMessage: labels.failedMessage,
        });

        setVerification({
          state: "resolved",
          ...outcome,
        });

        if (outcome.isPaid) {
          // GTM `purchase` — once per order per session (docs/analytics-events.md).
          trackPurchaseOnce({
            transaction_id: String(contractUuid),
            value: outcome.statusData?.paidAmount ?? undefined,
            currency: "SAR",
            contract_type:
              outcome.statusData?.kind === "lessor_change"
                ? "lessor_change"
                : (outcome.statusData?.contractType?.toLowerCase() === "commercial"
                    ? "commercial"
                    : "housing"),
          });

          // The paid order now lives on the server: clear the local draft so
          // the next "create contract" starts clean (only when this draft is
          // the one that was just paid).
          const draft = useCreateContractDraftStore.getState();
          if (
            draft.contractSession?.uuid != null &&
            String(draft.contractSession.uuid) === String(contractUuid)
          ) {
            resetCreateContractDraft();
          }
          router.refresh();
        }
      } catch {
        if (!isMounted) {
          return;
        }

        setVerification({
          state: "resolved",
          variant: "error",
          message: labels.failedMessage,
          statusData: null,
          isPaid: false,
        });
      }
    }

    void verify();

    return () => {
      isMounted = false;
    };
  }, [
    contractUuid,
    labels.completedMessage,
    labels.failedMessage,
    router,
    status,
  ]);

  if (verification.state === "loading") {
    return (
      <section className="container py-8 lg:py-10">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-sm md:p-12 dark:bg-[#1a2421]">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand-background text-brand">
            <LoaderCircle className="size-9 animate-spin" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-2xl font-extrabold text-brand md:text-3xl">
            {labels.checkingTitle}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#7f7f7f]">
            {labels.checkingDescription}
          </p>
        </div>
      </section>
    );
  }

  const isPaid = verification.isPaid;

  return (
    <PaymentStatusContent
      variant={verification.variant}
      backLabel={labels.backLabel}
      pageTitle={isPaid ? labels.successPageTitle : labels.errorPageTitle}
      title={isPaid ? labels.successTitle : labels.errorTitle}
      description={
        isPaid ? labels.successDescription : labels.errorDescription
      }
      message={verification.message}
      contractNumberLabel={labels.contractNumberLabel}
      contractTypeLabel={labels.contractTypeLabel}
      paidAmountLabel={labels.paidAmountLabel}
      housingContractTypeLabel={labels.housingContractTypeLabel}
      commercialContractTypeLabel={labels.commercialContractTypeLabel}
      lessorChangeTypeLabel={labels.lessorChangeTypeLabel}
      contractNumber={contractUuid}
      backToRequestsLabel={labels.backToRequestsLabel}
      backToHomeLabel={labels.backToHomeLabel}
      retryPaymentLabel={labels.retryPaymentLabel}
      retryPaymentLoadingLabel={labels.retryPaymentLoadingLabel}
      retryPaymentErrorLabel={labels.retryPaymentErrorLabel}
      successHeadline={labels.successHeadline}
      successNextStep={labels.successNextStep}
      successNextStepLessorChange={labels.successNextStepLessorChange}
      journeyTitle={labels.journeyTitle}
      trackOrderLabel={labels.trackOrderLabel}
      whatsappSupportLabel={labels.whatsappSupportLabel}
      whatsappSupportMessage={labels.whatsappSupportMessage}
      paymentContent={paymentContent}
      status={verification.statusData}
    />
  );
}
