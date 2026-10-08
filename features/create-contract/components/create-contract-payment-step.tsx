"use client";

import { Lock } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth/stores/use-auth-store";
import { postContractLead } from "@/features/create-contract/services/post-contract-lead";
import { toPropertyContractType } from "@/features/create-contract/types/contract-type";
import { formatSaudiMobileForForm } from "@/lib/validation/format-saudi-mobile-for-form";
import { Switch } from "@/components/ui/switch";
import ContractPaymentMethodFlowDialogs from "@/features/create-contract/components/contract-payment-method-flow-dialogs";
import CreateContractDiscountCodeField from "@/features/create-contract/components/create-contract-discount-code-field";
import CreateContractPaymentHero from "@/features/create-contract/components/create-contract-payment-hero";
import CreateContractPaymentNavigation from "@/features/create-contract/components/create-contract-payment-navigation";
import CreateContractPaymentSummary from "@/features/create-contract/components/create-contract-payment-summary";
import CreateContractSaveLaterDialog from "@/features/create-contract/components/create-contract-save-later-dialog";
import { SAVE_LATER_ON_PAYMENT_ENABLED } from "@/features/create-contract/config";
import CreateContractSavePropertyDialog from "@/features/create-contract/components/create-contract-save-property-dialog";
import { useApplyContractCoupon } from "@/features/create-contract/hooks/use-apply-contract-coupon";
import { useContractFinanceSummary } from "@/features/create-contract/hooks/use-contract-finance-summary";
import { useContractPaymentMethodFlow } from "@/features/create-contract/hooks/use-contract-payment-method-flow";
import { useCreateContractPaymentStep } from "@/features/create-contract/hooks/use-create-contract-payment-step";
import { useSaveContractDraft } from "@/features/create-contract/hooks/use-save-contract-draft";
import { useSaveProperty } from "@/features/create-contract/hooks/use-save-property";
import { useCouponAvailability } from "@/features/pricing/hooks/use-coupon-availability";
import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import type { ContractTypeId } from "@/features/create-contract/types/contract-type";
import {
  formatPaymentAmount,
  PAYMENT_BREAKDOWN,
} from "@/features/create-contract/types/payment-step";
import { resetCreateContractDraft } from "@/features/create-contract/utils/reset-create-contract-draft";
import LegalDocumentDialog, {
  type LegalDocumentKind,
} from "@/features/settings/components/legal-document-dialog";

type CreateContractPaymentStepProps = {
  labels: CreateContractLabels["payment"];
  saveLaterDialogLabels: CreateContractLabels["tenant"]["saveLaterDialog"];
  contractType: ContractTypeId;
  /** Guest flow: the WhatsApp number typed on the submit step (lead phone). */
  fallbackPhone?: string;
  onBack: () => void;
};

function withTemplate(
  template: string,
  values: Record<string, string | number>,
) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export default function CreateContractPaymentStep({
  labels,
  saveLaterDialogLabels,
  contractType,
  fallbackPhone = "",
  onBack,
}: CreateContractPaymentStepProps) {
  const tFooter = useTranslations("footer");
  const router = useRouter();
  const { paymentData, setPaymentData } = useCreateContractPaymentStep();
  const contractSession = useCreateContractDraftStore((state) => state.contractSession);
  const contractStep1Data = useCreateContractDraftStore(
    (state) => state.contractStep1Data,
  );
  const contractUuid =
    contractSession?.uuid ?? contractStep1Data?.uuid ?? null;
  const contractId =
    contractSession?.contractId ?? contractStep1Data?.contract_id ?? null;
  const { appliedCoupon, isApplying, applyCoupon, clearCouponDraft } =
    useApplyContractCoupon(contractUuid);
  const financeSummaryQuery = useContractFinanceSummary(contractUuid);
  const { submitSaveProperty, submitUnsaveProperty, isSaving } = useSaveProperty();
  const { saveDraft, isSaving: isSavingDraft } = useSaveContractDraft();
  const { available: couponsAvailable } = useCouponAvailability();
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [saveLaterDialogOpen, setSaveLaterDialogOpen] = useState(false);
  // Guards the save-property toggle against double clicks while a request runs.
  const savePropertyBusyRef = useRef(false);
  const [legalDocument, setLegalDocument] = useState<LegalDocumentKind | null>(
    null,
  );

  const paymentFlow = useContractPaymentMethodFlow(
    contractSession?.contractId,
    contractSession?.uuid,
    {
      methodDialog: labels.methodDialog,
      draftSuccessDialog: labels.draftSuccessDialog,
      discountCode: labels.discountCode,
      payError: labels.navigation.payError,
    },
  );

  const fallbackTotal = PAYMENT_BREAKDOWN[contractType].total;
  // «هل تود حفظ بيانات العقار؟»: hidden when the contract came from a saved
  // property (server `saved_property.show_option === false`, or locally a
  // real-property session); the toggle starts from the server's `saved`.
  const existingPropertyContext = useCreateContractDraftStore(
    (state) => state.existingPropertyContext,
  );
  const savedPropertyState = financeSummaryQuery.data?.saved_property ?? null;
  const showSavePropertyOption =
    savedPropertyState?.show_option !== false &&
    existingPropertyContext === null &&
    contractSession?.isReal !== true;
  const savePropertyChecked =
    paymentData.savePropertyData || savedPropertyState?.saved === true;
  const payableTotal = appliedCoupon
    ? appliedCoupon.totalPriceAfterCoupon
    : (financeSummaryQuery.data?.total_price ?? fallbackTotal);
  const authUser = useAuthStore((state) => state.user);
  const leadFiredForUuid = useRef<string | null>(null);
  // Pending on first load, or refetching after step 6 was (re)saved.
  const financeSummaryIsPending =
    financeSummaryQuery.isPending || financeSummaryQuery.isFetching;
  const financeSummaryTotal = financeSummaryQuery.data
    ? appliedCoupon
      ? appliedCoupon.totalPriceAfterCoupon
      : financeSummaryQuery.data.total_price
    : null;

  // CR2: capture an abandoned-payment lead as soon as the payment screen mounts.
  // Idempotent server-side (per contract_uuid); the ref avoids duplicate calls.
  useEffect(() => {
    if (!contractUuid || !contractId) {
      return;
    }

    if (leadFiredForUuid.current === contractUuid) {
      return;
    }

    // Wait for the single-source total before firing, otherwise the lead would
    // carry the hard-coded fallback amount instead of the real one.
    if (financeSummaryIsPending) {
      return;
    }

    leadFiredForUuid.current = contractUuid;

    const leadPhone = formatSaudiMobileForForm(
      authUser?.phone || authUser?.mobile || fallbackPhone || "",
    );

    void postContractLead({
      name: authUser?.full_name || authUser?.name || "",
      phone: leadPhone,
      contractUuid,
      contractId,
      // When the summary failed to load, omit the amount and let the backend
      // fill it from the contract (contract §7: missing amount is auto-filled).
      amount: financeSummaryTotal ?? undefined,
      contractType:
        contractSession?.contractType ?? toPropertyContractType(contractType),
    });
  }, [
    authUser,
    contractId,
    contractSession?.contractType,
    contractType,
    contractUuid,
    fallbackPhone,
    financeSummaryIsPending,
    financeSummaryTotal,
  ]);

  const hasDiscount =
    Boolean(appliedCoupon) &&
    typeof appliedCoupon?.discount === "number" &&
    appliedCoupon.discount > 0;
  const discountAmount = appliedCoupon?.discount ?? 0;
  const discountPercent =
    appliedCoupon && appliedCoupon.totalPriceBeforeCoupon > 0
      ? Math.round(
          (appliedCoupon.discount / appliedCoupon.totalPriceBeforeCoupon) * 100,
        )
      : 0;

  const selectedMethod = paymentFlow.selectedPaymentMethod;
  // CR1: direct payment — always show the pay-with-amount label (no draft step).
  // The amount on the button comes only from the server summary: while it is
  // loading (or failed) the button shows no number and stays disabled — before,
  // it showed the fixed 249/349 while the gateway would charge e.g. 724.
  const summaryReady = financeSummaryTotal != null && !financeSummaryIsPending;
  const payLabel = summaryReady
    ? withTemplate(labels.navigation.payWithAmount, {
        amount: formatPaymentAmount(payableTotal),
      })
    : labels.navigation.pay;

  function handleSwitchChange(checked: boolean) {
    if (savePropertyBusyRef.current || isSaving) {
      return;
    }

    if (checked) {
      setIsPropertyDialogOpen(true);
      return;
    }

    void handleUnsaveProperty();
  }

  async function handleUnsaveProperty() {
    savePropertyBusyRef.current = true;

    try {
      // Nothing was saved on the server yet → just clear the local flag.
      if (!paymentData.savePropertyData && savedPropertyState?.saved !== true) {
        setPaymentData({ ...paymentData, savePropertyData: false, propertyName: "" });
        return;
      }

      const result = await submitUnsaveProperty({
        missingContractSession:
          labels.savePropertyData.dialog.missingContractSession,
        submitError: labels.savePropertyData.dialog.submitError,
      });

      if (!result.ok) {
        return;
      }

      setPaymentData({ ...paymentData, savePropertyData: false, propertyName: "" });
      void financeSummaryQuery.refetch();
    } finally {
      savePropertyBusyRef.current = false;
    }
  }

  function handlePropertyDialogOpenChange(open: boolean) {
    setIsPropertyDialogOpen(open);
  }

  async function handleSaveProperty(propertyName: string) {
    if (savePropertyBusyRef.current) {
      return;
    }

    savePropertyBusyRef.current = true;

    try {
      const result = await submitSaveProperty(propertyName, {
        missingContractSession: labels.savePropertyData.dialog.missingContractSession,
        submitError: labels.savePropertyData.dialog.submitError,
        submitSuccess: labels.savePropertyData.dialog.submitSuccess,
      });

      if (!result.ok) {
        return;
      }

      setPaymentData({
        ...paymentData,
        savePropertyData: true,
        propertyName: result.propertyName,
      });
      setIsPropertyDialogOpen(false);
      void financeSummaryQuery.refetch();
    } finally {
      savePropertyBusyRef.current = false;
    }
  }

  async function handleConfirmSaveLater() {
    if (isSavingDraft || paymentFlow.isSubmitting) {
      return;
    }

    const result = await saveDraft();

    if (!result.ok) {
      toast.error(
        result.error === "missingContractSession"
          ? labels.navigation.payError
          : result.error || labels.navigation.saveError,
      );
      return;
    }

    setSaveLaterDialogOpen(false);
    resetCreateContractDraft();
    router.push("/requests");
  }

  return (
    <div className="space-y-4">
      <div className="p-3 md:p-5">
        <div className="space-y-3">
          <CreateContractPaymentHero
            securePaymentLabel={labels.securePaymentLabel}
          />

          <CreateContractPaymentSummary
            labels={labels.summary}
            contractType={contractType}
            appliedCoupon={appliedCoupon}
          />

          {selectedMethod ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#cfe8dd] bg-[#f5fbf8] px-4 py-3 dark:border-[#2f403b] dark:bg-[#16352f]">
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-extrabold text-brand dark:text-[#48c0b8]">
                  {selectedMethod === "draft"
                    ? labels.methodDialog.selected.draft.title
                    : labels.methodDialog.selected.payNow.title}
                </p>
                <p className="text-xs leading-relaxed text-[#4f6b62] dark:text-[#9eb5af]">
                  {selectedMethod === "draft"
                    ? labels.methodDialog.selected.draft.description
                    : hasDiscount
                      ? withTemplate(labels.methodDialog.selected.payNow.savings, {
                          percent: discountPercent,
                          amount: formatPaymentAmount(discountAmount),
                        })
                      : labels.methodDialog.selected.payNow.description}
                </p>
              </div>
              <button
                type="button"
                onClick={paymentFlow.openMethodDialog}
                className="shrink-0 text-xs font-bold text-brand underline underline-offset-2 transition-opacity hover:opacity-70 dark:text-[#48c0b8]"
              >
                {labels.methodDialog.changeMethod}
              </button>
            </div>
          ) : null}

          {showSavePropertyOption ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#e8e8e8] bg-white px-4 py-4 dark:border-[#2f403b] dark:bg-[#121a18]">
              <label className="flex w-full cursor-pointer items-center justify-between gap-3">
                <span className="flex flex-col gap-1">
                  <span className="text-sm font-semibold leading-relaxed text-brand dark:text-[#48c0b8]">
                    {labels.savePropertyData.label}
                  </span>
                  <span className="text-xs leading-relaxed text-[#7f7f7f] dark:text-[#9eb5af]">
                    {labels.savePropertyData.description}
                  </span>
                </span>
                <Switch
                  dir="ltr"
                  checked={savePropertyChecked}
                  onCheckedChange={handleSwitchChange}
                  disabled={isSaving}
                  className="h-6 w-11 shrink-0 data-checked:bg-brand-secondary data-unchecked:bg-[#d9d9d9] disabled:cursor-not-allowed disabled:opacity-70 dark:data-unchecked:bg-[#2f403b]"
                />
              </label>
            </div>
          ) : null}

          {couponsAvailable ? (
            <CreateContractDiscountCodeField
              labels={labels.discountCode}
              appliedCoupon={appliedCoupon}
              isApplying={isApplying}
              onApply={applyCoupon}
              onClear={clearCouponDraft}
            />
          ) : null}

          <div className="flex justify-center">
            <Image
              src="/images/payments.png"
              alt={tFooter("paymentsAlt")}
              width={280}
              height={40}
              className="h-auto w-full max-w-70 object-contain"
            />
          </div>

          <p className="text-center text-xs leading-relaxed text-[#7f7f7f] dark:text-[#9eb5af]">
            {labels.disclaimer.prefix}{" "}
            <button
              type="button"
              onClick={() => setLegalDocument("terms")}
              className="font-semibold text-brand-secondary underline underline-offset-2 dark:text-[#48c0b8]"
            >
              {labels.disclaimer.termsLink}
            </button>{" "}
            {labels.disclaimer.and}{" "}
            <button
              type="button"
              onClick={() => setLegalDocument("privacy")}
              className="font-semibold text-brand-secondary underline underline-offset-2 dark:text-[#48c0b8]"
            >
              {labels.disclaimer.privacyLink}
            </button>
            .
          </p>

          <CreateContractPaymentNavigation
            previousLabel={labels.navigation.previous}
            payLabel={payLabel}
            payingLabel={labels.navigation.paying}
            saveLabel={labels.navigation.save}
            isPaying={paymentFlow.isSubmitting}
            payDisabled={!summaryReady}
            isSaving={isSavingDraft}
            onPrevious={onBack}
            onPay={() => void paymentFlow.handlePrimaryAction()}
            onSave={
              SAVE_LATER_ON_PAYMENT_ENABLED
                ? () => setSaveLaterDialogOpen(true)
                : undefined
            }
          />
        </div>
      </div>

      <LegalDocumentDialog
        document={legalDocument}
        open={legalDocument != null}
        onOpenChange={(open) => {
          if (!open) {
            setLegalDocument(null);
          }
        }}
      />

      <CreateContractSavePropertyDialog
        labels={labels.savePropertyData.dialog}
        open={isPropertyDialogOpen}
        onOpenChange={handlePropertyDialogOpenChange}
        initialValue={paymentData.propertyName}
        isSaving={isSaving}
        onSave={handleSaveProperty}
      />

      <ContractPaymentMethodFlowDialogs
        labels={{
          methodDialog: labels.methodDialog,
          draftSuccessDialog: labels.draftSuccessDialog,
          discountCode: labels.discountCode,
          payError: labels.navigation.payError,
        }}
        isMethodDialogOpen={paymentFlow.isMethodDialogOpen}
        onMethodDialogOpenChange={paymentFlow.setIsMethodDialogOpen}
        isDraftSuccessDialogOpen={paymentFlow.isDraftSuccessDialogOpen}
        onDraftSuccessDialogOpenChange={paymentFlow.setIsDraftSuccessDialogOpen}
        draftOrderUuid={paymentFlow.draftOrderUuid}
        isSubmitting={paymentFlow.isSubmitting}
        hasDiscount={hasDiscount}
        totalPrice={
          appliedCoupon?.totalPriceBeforeCoupon ??
          financeSummaryQuery.data?.total_price ??
          fallbackTotal
        }
        discountedPrice={
          hasDiscount ? appliedCoupon?.totalPriceAfterCoupon ?? null : null
        }
        selectedMethod={paymentFlow.selectedPaymentMethod}
        onSelect={paymentFlow.selectPaymentMethod}
        payNowExtra={
          couponsAvailable ? (
            <CreateContractDiscountCodeField
              labels={labels.discountCode}
              appliedCoupon={appliedCoupon}
              isApplying={isApplying}
              onApply={applyCoupon}
              onClear={clearCouponDraft}
            />
          ) : null
        }
      />

      <CreateContractSaveLaterDialog
        labels={saveLaterDialogLabels}
        open={saveLaterDialogOpen}
        onOpenChange={setSaveLaterDialogOpen}
        orderNumber={contractId}
        isSaving={isSavingDraft}
        onConfirm={() => void handleConfirmSaveLater()}
      />

      <p className="mb-6 flex items-center justify-center gap-2 text-xs text-[#9a9a9a] dark:text-[#9eb5af]">
        <Lock className="size-3.5 shrink-0" aria-hidden="true" />
        <span>{labels.encryptionNote}</span>
      </p>
    </div>
  );
}
