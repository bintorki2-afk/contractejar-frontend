"use client";

import {
  AlertCircle,
  CircleCheck,
  FileText,
  Hash,
  Home,
  ListOrdered,
  Search,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";
import type { ContractPaymentStatusSource } from "@/features/create-contract/services/get-contract-payment-status";
import type { ContractPaymentStatusData } from "@/features/create-contract/types/contract-payment";
import { formatPaymentAmount } from "@/features/create-contract/types/payment-step";
import PaymentContentActionButton from "@/features/payment/components/payment-content-button";
import PaymentRetryButton from "@/features/payment/components/payment-retry-button";
import {
  parsePaymentContentButtons,
  type PaymentContentItem,
} from "@/features/payment/types/payment-content";
import OrderJourneySteps from "@/features/requests/components/order-journey-steps";
import { journeyAfterPayment } from "@/features/requests/data/order-journey";
import ServicesPageBackConfig from "@/features/services/components/services-page-back-config";
import { useWhatsappHref } from "@/features/settings/hooks/use-whatsapp-href";
import CustomIcon from "@/features/shared/components/custom-icon";

type PaymentStatusContentProps = {
  variant: "success" | "error";
  backLabel: string;
  pageTitle: string;
  title: string;
  description: string;
  message: string;
  contractNumberLabel: string;
  contractTypeLabel: string;
  paidAmountLabel: string;
  housingContractTypeLabel: string;
  commercialContractTypeLabel: string;
  lessorChangeTypeLabel: string;
  contractNumber: string;
  backToRequestsLabel: string;
  backToHomeLabel: string;
  retryPaymentLabel: string;
  retryPaymentLoadingLabel: string;
  retryPaymentErrorLabel: string;
  /** ف2 success copy. */
  successHeadline: string;
  successNextStep: string;
  successNextStepLessorChange: string;
  journeyTitle: string;
  trackOrderLabel: string;
  whatsappSupportLabel: string;
  whatsappSupportMessage: string;
  paymentContent?: PaymentContentItem | null;
  source?: ContractPaymentStatusSource;
  status?: ContractPaymentStatusData | null;
};

function resolveContractTypeDisplay(
  status: ContractPaymentStatusData | null | undefined,
  labels: {
    housing: string;
    commercial: string;
    lessorChange: string;
  },
) {
  if (!status) {
    return null;
  }

  if (status.kind === "lessor_change") {
    return labels.lessorChange;
  }

  if (status.contractTypeTrans) {
    return status.contractTypeTrans;
  }

  const type = status.contractType?.toLowerCase();
  if (type === "housing" || type === "residential") {
    return labels.housing;
  }
  if (type === "commercial") {
    return labels.commercial;
  }

  return status.contractType;
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#ececec] bg-brand-background p-4 dark:border-[#2f403b] dark:bg-[#121a18]">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-brand dark:bg-[#1a2421] dark:text-[#48c0b8]">
          {icon}
        </span>
        <div className="min-w-0 text-start">
          <p className="text-xs text-muted-foreground">{label}</p>
          <div className="mt-1 text-lg font-extrabold text-foreground">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentStatusContent({
  variant,
  backLabel,
  pageTitle,
  title,
  description,
  message,
  contractNumberLabel,
  contractTypeLabel,
  paidAmountLabel,
  housingContractTypeLabel,
  commercialContractTypeLabel,
  lessorChangeTypeLabel,
  contractNumber,
  backToRequestsLabel,
  backToHomeLabel,
  retryPaymentLabel,
  retryPaymentLoadingLabel,
  retryPaymentErrorLabel,
  successHeadline,
  successNextStep,
  successNextStepLessorChange,
  journeyTitle,
  trackOrderLabel,
  whatsappSupportLabel,
  whatsappSupportMessage,
  paymentContent = null,
  source = "contract",
  status,
}: PaymentStatusContentProps) {
  const isSuccess = variant === "success";
  const isLessorChange = status?.kind === "lessor_change";
  const orderNumber = contractNumber.replace(/^#/, "");
  const formattedContractNumber = `#${orderNumber}`;
  const apiButtons = parsePaymentContentButtons(paymentContent);
  const apiMessage = paymentContent?.message?.trim() || "";
  const contractTypeDisplay = resolveContractTypeDisplay(status, {
    housing: housingContractTypeLabel,
    commercial: commercialContractTypeLabel,
    lessorChange: lessorChangeTypeLabel,
  });
  const paidAmount = status?.paidAmount;
  const whatsappHref = useWhatsappHref();
  const whatsappSupportHref = `${whatsappHref}${whatsappHref.includes("?") ? "&" : "?"}text=${encodeURIComponent(
    whatsappSupportMessage,
  )}`;

  // Error screen keeps the API message as the main text (legacy behaviour).
  const errorMainText = apiMessage || description;
  const errorSubText = apiMessage ? message : "";

  return (
    <>
      <ServicesPageBackConfig
        backLabel={backLabel}
        backHref="/requests"
        pageTitle={pageTitle}
      />

      <div className="mx-auto w-full max-w-2xl space-y-4">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm dark:bg-[#1a2421]">
          <div
            className={`px-6 py-8 text-center md:px-10 md:py-10 ${
              isSuccess
                ? "bg-linear-to-b from-[#f3fbf8] to-white dark:from-[#16352f] dark:to-[#1a2421]"
                : "bg-linear-to-b from-[#fff5f5] to-white dark:from-[#2a1818] dark:to-[#1a2421]"
            }`}
          >
            <div className="relative mx-auto flex w-fit items-center justify-center pb-2">
              <span
                className={`absolute top-8 size-20 rounded-full blur-2xl ${
                  isSuccess ? "bg-brand-secondary/40" : "bg-red-300/50"
                }`}
                aria-hidden="true"
              />
              <div
                className={`relative flex size-20 items-center justify-center rounded-full shadow-lg ${
                  isSuccess
                    ? "bg-linear-to-bl from-brand-secondary via-brand to-brand shadow-[0_10px_28px_rgba(13,179,139,0.28)]"
                    : "bg-linear-to-bl from-red-500 via-red-600 to-red-700 shadow-[0_10px_28px_rgba(239,68,68,0.25)]"
                }`}
              >
                {isSuccess ? (
                  <CustomIcon
                    src="/icons/shiled-check.svg"
                    size={32}
                    className="text-white"
                  />
                ) : (
                  <AlertCircle className="size-9 text-white" aria-hidden="true" />
                )}
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  isSuccess
                    ? "bg-brand-secondary/10 text-brand-secondary"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {isSuccess ? (
                  <CircleCheck className="size-3.5" aria-hidden="true" />
                ) : (
                  <AlertCircle className="size-3.5" aria-hidden="true" />
                )}
                {title}
              </div>

              <h1 className="text-2xl font-extrabold leading-relaxed text-brand md:text-3xl dark:text-[#48c0b8]">
                {isSuccess ? successHeadline : errorMainText}
              </h1>

              {isSuccess ? (
                <p className="mx-auto max-w-md text-sm leading-7 text-[#4d5f5a] md:text-base dark:text-[#9eb5af]">
                  {isLessorChange ? successNextStepLessorChange : successNextStep}
                </p>
              ) : errorSubText ? (
                <p className="mx-auto max-w-md text-sm leading-relaxed text-[#7f7f7f]">
                  {errorSubText}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-3 px-6 pb-6 pt-2 md:px-10 md:pb-8">
            <InfoRow icon={<Hash className="size-4" aria-hidden="true" />} label={contractNumberLabel}>
              <p className="truncate" dir="ltr">
                {formattedContractNumber}
              </p>
            </InfoRow>

            {contractTypeDisplay ? (
              <InfoRow icon={<FileText className="size-4" aria-hidden="true" />} label={contractTypeLabel}>
                <p>{contractTypeDisplay}</p>
              </InfoRow>
            ) : null}

            {paidAmount != null ? (
              <InfoRow icon={<Wallet className="size-4" aria-hidden="true" />} label={paidAmountLabel}>
                <p className="inline-flex items-center gap-1.5">
                  <span>{formatPaymentAmount(paidAmount)}</span>
                  <CustomIcon
                    src="/icons/ryal.svg"
                    size={16}
                    className="shrink-0 text-foreground"
                  />
                </p>
              </InfoRow>
            ) : null}

            {isSuccess && !isLessorChange ? (
              <section className="rounded-2xl border border-[#ececec] bg-white p-4 dark:border-[#2f403b] dark:bg-[#121a18]">
                <p className="mb-3 text-sm font-extrabold text-foreground">{journeyTitle}</p>
                <OrderJourneySteps steps={journeyAfterPayment()} showSentence compact />
              </section>
            ) : null}

            {isSuccess && apiMessage ? (
              <p className="rounded-2xl bg-brand-background px-4 py-3 text-center text-xs leading-6 text-[#5c6b68] dark:bg-[#121a18] dark:text-[#9eb5af]">
                {apiMessage}
              </p>
            ) : null}

            <div className="space-y-3 pt-2">
              {isSuccess ? (
                <>
                  <Button
                    asChild
                    className="h-12 w-full rounded-xl bg-linear-to-br from-brand-secondary via-brand to-brand text-sm font-bold text-white hover:opacity-90"
                  >
                    <Link href={`/r/${encodeURIComponent(orderNumber)}`}>
                      <Search className="size-4" aria-hidden="true" />
                      {trackOrderLabel}
                    </Link>
                  </Button>

                  <Button
                    asChild
                    className="h-12 w-full rounded-xl bg-[#25d366] text-sm font-bold text-white hover:bg-[#1ebe5a]"
                  >
                    <Link
                      href={whatsappSupportHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track("cta_whatsapp_click", { placement: "payment_success" })}
                    >
                      <FaWhatsapp className="size-5" aria-hidden="true" />
                      {whatsappSupportLabel}
                    </Link>
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      asChild
                      variant="outline"
                      className="h-12 rounded-xl border-[#e8e8e8] bg-white text-sm font-bold text-brand hover:bg-brand-background dark:border-[#2f403b] dark:bg-[#1a2421] dark:text-[#48c0b8]"
                    >
                      <Link href="/requests">
                        <ListOrdered className="size-4" aria-hidden="true" />
                        {backToRequestsLabel}
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-12 rounded-xl border-[#e8e8e8] bg-white text-sm font-bold text-brand hover:bg-brand-background dark:border-[#2f403b] dark:bg-[#1a2421] dark:text-[#48c0b8]"
                    >
                      <Link href="/">
                        <Home className="size-4" aria-hidden="true" />
                        {backToHomeLabel}
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <PaymentRetryButton
                    contractUuid={orderNumber}
                    source={source}
                    label={retryPaymentLabel}
                    payingLabel={retryPaymentLoadingLabel}
                    errorLabel={retryPaymentErrorLabel}
                  />

                  <Button
                    asChild
                    variant="outline"
                    className="h-12 w-full rounded-xl border-[#e8e8e8] bg-white text-sm font-bold text-brand hover:bg-brand-background dark:border-[#2f403b] dark:bg-[#1a2421] dark:text-[#48c0b8]"
                  >
                    <Link href="/requests">
                      <ListOrdered className="size-4" aria-hidden="true" />
                      {backToRequestsLabel}
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-12 w-full rounded-xl border-[#25d366]/40 bg-white text-sm font-bold text-[#1ebe5a] hover:bg-[#f0fdf4] dark:bg-[#1a2421]"
                  >
                    <Link
                      href={whatsappSupportHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track("cta_whatsapp_click", { placement: "payment_error" })}
                    >
                      <FaWhatsapp className="size-5" aria-hidden="true" />
                      {whatsappSupportLabel}
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="ghost"
                    className="h-11 w-full rounded-xl text-sm font-semibold text-muted-foreground hover:bg-brand-background hover:text-brand"
                  >
                    <Link href="/">
                      <Home className="size-4" aria-hidden="true" />
                      {backToHomeLabel}
                    </Link>
                  </Button>
                </>
              )}

              {apiButtons.map((button, index) => (
                <PaymentContentActionButton
                  key={`${button.href}-${button.text}`}
                  button={button}
                  variant={index === 0 ? "primary" : "secondary"}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
