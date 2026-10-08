import { getTranslations } from "next-intl/server";

import PaymentStatusVerifier from "@/features/payment/components/payment-status-verifier";
import { getPaymentContent } from "@/features/payment/services/get-payment-content";

type PaymentErrorPageProps = {
  params: Promise<{
    contractUuid: string;
  }>;
};

export default async function PaymentErrorPage({ params }: PaymentErrorPageProps) {
  const [{ contractUuid }, t, paymentContent] = await Promise.all([
    params,
    getTranslations("paymentStatus"),
    getPaymentContent("failed"),
  ]);

  return (
    <PaymentStatusVerifier
      contractUuid={contractUuid}
      status="error"
      paymentContent={paymentContent}
      labels={{
        backLabel: t("backLabel"),
        successPageTitle: t("success.pageTitle"),
        successTitle: t("success.title"),
        successDescription: t("success.description"),
        errorPageTitle: t("error.pageTitle"),
        errorTitle: t("error.title"),
        errorDescription: t("error.description"),
        contractNumberLabel: t("contractNumberLabel"),
        contractTypeLabel: t("contractTypeLabel"),
        paidAmountLabel: t("paidAmountLabel"),
        housingContractTypeLabel: t("housingContractTypeLabel"),
        commercialContractTypeLabel: t("commercialContractTypeLabel"),
        lessorChangeTypeLabel: t("lessorChangeTypeLabel"),
        backToRequestsLabel: t("backToRequests"),
        backToHomeLabel: t("backToHome"),
        retryPaymentLabel: t("retryPayment"),
        retryPaymentLoadingLabel: t("retryPaymentLoading"),
        retryPaymentErrorLabel: t("retryPaymentError"),
        checkingTitle: t("checkingTitle"),
        checkingDescription: t("checkingDescription"),
        completedMessage: t("completedMessage"),
        failedMessage: t("failedMessage"),
        successHeadline: t("success.headline"),
        successNextStep: t("success.nextStep"),
        successNextStepLessorChange: t("success.nextStepLessorChange"),
        journeyTitle: t("success.journeyTitle"),
        trackOrderLabel: t("trackOrder"),
        whatsappSupportLabel: t("whatsappSupport"),
        whatsappSupportMessage: t("whatsappSupportMessage", { order: contractUuid }),
      }}
    />
  );
}
