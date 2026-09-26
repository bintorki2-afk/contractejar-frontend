"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import CreateContractLeaseRenewalUnitChoice from "@/features/create-contract/components/create-contract-lease-renewal-unit-choice";
import CreateContractRentedUnitDataPhase from "@/features/create-contract/components/create-contract-rented-unit-data-phase";
import CreateContractSaveLaterDialog from "@/features/create-contract/components/create-contract-save-later-dialog";
import CreateContractStepNavigation from "@/features/create-contract/components/create-contract-step-navigation";
import CreateContractStepPhaseHeader from "@/features/create-contract/components/create-contract-step-phase-header";
import CreateContractStepPhaseProgress from "@/features/create-contract/components/create-contract-step-phase-progress";
import CreateContractTenantIndividualDataPhase from "@/features/create-contract/components/create-contract-tenant-individual-data-phase";
import CreateContractTenantOrganizationDataPhase from "@/features/create-contract/components/create-contract-tenant-organization-data-phase";
import CreateContractTenantStatusSelect from "@/features/create-contract/components/create-contract-tenant-status-select";
import { useCreateContractTenantStep } from "@/features/create-contract/hooks/use-create-contract-tenant-step";
import { SAVE_DRAFT_ENABLED } from "@/features/create-contract/config";
import { useSaveContractDraft } from "@/features/create-contract/hooks/use-save-contract-draft";
import { useSubmitContractStep4 } from "@/features/create-contract/hooks/use-submit-contract-step4";
import { useSubmitContractStep5 } from "@/features/create-contract/hooks/use-submit-contract-step5";
import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import { resetCreateContractDraft } from "@/features/create-contract/utils/reset-create-contract-draft";
import { isOrganizationTenantStatus } from "@/features/create-contract/types/tenant-step";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import type { ContractTypeId } from "@/features/create-contract/types/contract-type";
import { scrollToFirstInvalidField } from "@/features/shared/utils/scroll-to-first-invalid-field";

type CreateContractTenantStepProps = {
  labels: CreateContractLabels["tenant"];
  contractType: ContractTypeId;
  onBack: () => void;
  onComplete: () => void;
};

export default function CreateContractTenantStep({
  labels,
  onBack,
  onComplete,
}: CreateContractTenantStepProps) {
  const tIncomplete = useTranslations("createContract");
  const {
    currentPhaseIndex,
    phaseCount,
    tenantData,
    setTenantData,
    rentedUnits,
    setRentedUnits,
    leaseRenewalUnitMode,
    setLeaseRenewalUnitMode,
    isLeaseRenewal,
    updateStatus,
    canContinue,
    isLastPhase,
    goToNextPhase,
    goToPreviousPhase,
  } = useCreateContractTenantStep();
  const router = useRouter();
  const { submitStep4, isSubmitting: isSubmittingStep4 } = useSubmitContractStep4();
  const { submitStep5, isSubmitting: isSubmittingStep5 } = useSubmitContractStep5();
  const { saveDraft, isSaving: isSavingDraft } = useSaveContractDraft();
  const contractSession = useCreateContractDraftStore((state) => state.contractSession);
  const isSubmitting = isSubmittingStep4 || isSubmittingStep5;
  const [showFieldErrors, setShowFieldErrors] = useState(false);
  const [saveLaterDialogOpen, setSaveLaterDialogOpen] = useState(false);

  // Lease renewal: tenant → unit choice (+ form if editing) → finance.
  // Sublease / normal: tenant identity → rented unit.
  const rentedUnitPhaseLabels = labels.phases[1] ?? labels.phases[0];
  const isTenantDataPhase = currentPhaseIndex === 0;
  const isLeaseRenewalUnitPhase = isLeaseRenewal && currentPhaseIndex === 1;
  const isRentedUnitPhase =
    (!isLeaseRenewal && currentPhaseIndex === 1) ||
    (isLeaseRenewalUnitPhase && leaseRenewalUnitMode === "change");

  const phaseTitle = isLeaseRenewalUnitPhase
    ? rentedUnitPhaseLabels.title
    : (labels.phases[currentPhaseIndex]?.title ?? labels.phases[0].title);
  const phaseSubtitle = isLeaseRenewalUnitPhase
    ? rentedUnitPhaseLabels.subtitle
    : (labels.phases[currentPhaseIndex]?.subtitle ?? labels.phases[0].subtitle);

  function handlePrevious() {
    if (currentPhaseIndex === 0) {
      onBack();
      return;
    }

    goToPreviousPhase();
  }

  async function handleContinue() {
    if (isSubmitting) {
      return;
    }

    if (!canContinue) {
      setShowFieldErrors(true);
      toast.error(tIncomplete("incompleteContinue"));
      setTimeout(scrollToFirstInvalidField, 0);
      return;
    }

    setShowFieldErrors(false);

    if (isLeaseRenewal && isTenantDataPhase) {
      goToNextPhase();
      return;
    }

    if (isLeaseRenewalUnitPhase) {
      const submittedTenant = await submitStep4({
        tenantData,
        isLeaseRenewal: true,
      });

      if (!submittedTenant) {
        return;
      }

      if (leaseRenewalUnitMode === "change") {
        const submittedUnit = await submitStep5({ rentedUnits });

        if (!submittedUnit) {
          return;
        }
      }

      onComplete();
      return;
    }

    if (isTenantDataPhase) {
      const submitted = await submitStep4({
        tenantData,
        isLeaseRenewal: false,
      });

      if (!submitted) {
        return;
      }
    }

    if (isRentedUnitPhase) {
      const submitted = await submitStep5({
        rentedUnits,
      });

      if (!submitted) {
        return;
      }
    }

    if (isLastPhase) {
      onComplete();
      return;
    }

    goToNextPhase();
  }

  const showSaveLaterActions = SAVE_DRAFT_ENABLED && Boolean(contractSession);

  function handleOpenSaveLater() {
    if (isSavingDraft || isSubmitting) {
      return;
    }

    setSaveLaterDialogOpen(true);
  }

  async function handleConfirmSaveLater() {
    if (isSavingDraft || isSubmitting) {
      return;
    }

    const result = await saveDraft();

    if (!result.ok) {
      if (result.error === "missingContractSession") {
        toast.error(labels.missingContractSession);
        return;
      }

      toast.error(result.error || labels.saveLaterError);
      return;
    }

    setSaveLaterDialogOpen(false);
    resetCreateContractDraft();
    router.push("/requests");
  }

  return (
    <>
      <div className="p-3 md:p-5">
        <CreateContractStepPhaseProgress
          totalPhases={phaseCount}
          currentPhaseIndex={currentPhaseIndex}
          className="mb-5"
        />

        <CreateContractStepPhaseHeader
          title={phaseTitle}
          subtitle={phaseSubtitle}
        />

        {isTenantDataPhase ? (
          <>
            <CreateContractTenantStatusSelect
              labels={labels.tenantStatus}
              value={tenantData.status || "individual"}
              onChange={updateStatus}
              invalid={showFieldErrors && tenantData.status === ""}
            />

            {(tenantData.status || "individual") === "individual" ? (
              <CreateContractTenantIndividualDataPhase
                labels={labels.individualData}
                birthDateLabels={labels.birthDate}
                value={tenantData.individual}
                onChange={(individual) =>
                  setTenantData({ ...tenantData, individual })
                }
                showFieldErrors={showFieldErrors}
              />
            ) : null}

            {isOrganizationTenantStatus(tenantData.status) ? (
              <CreateContractTenantOrganizationDataPhase
                labels={labels.organizationData}
                birthDateLabels={labels.birthDate}
                value={tenantData.organization}
                onChange={(organization) =>
                  setTenantData({ ...tenantData, organization })
                }
                showFieldErrors={showFieldErrors}
              />
            ) : null}
          </>
        ) : null}

        {isLeaseRenewalUnitPhase ? (
          <div className="space-y-3">
            <CreateContractLeaseRenewalUnitChoice
              labels={labels.leaseRenewal}
              value={leaseRenewalUnitMode}
              onChange={setLeaseRenewalUnitMode}
            />

            {leaseRenewalUnitMode === "change" ? (
              <CreateContractRentedUnitDataPhase
                labels={labels.rentedUnit}
                units={rentedUnits}
                onChange={setRentedUnits}
                showFieldErrors={showFieldErrors}
              />
            ) : null}
          </div>
        ) : null}

        {!isLeaseRenewal && isRentedUnitPhase ? (
          <CreateContractRentedUnitDataPhase
            labels={labels.rentedUnit}
            units={rentedUnits}
            onChange={setRentedUnits}
            showFieldErrors={showFieldErrors}
          />
        ) : null}

        <CreateContractStepNavigation
          previousLabel={labels.navigation.previous}
          continueLabel={
            isSubmitting
              ? labels.navigation.submitting
              : labels.navigation.continue
          }
          saveLaterLabel={
            showSaveLaterActions ? labels.navigation.saveLater : undefined
          }
          isSubmitting={isSubmitting || isSavingDraft}
          onPrevious={handlePrevious}
          onContinue={() => void handleContinue()}
          onSaveLater={showSaveLaterActions ? handleOpenSaveLater : undefined}
        />
      </div>

      <CreateContractSaveLaterDialog
        labels={labels.saveLaterDialog}
        open={saveLaterDialogOpen}
        onOpenChange={setSaveLaterDialogOpen}
        orderNumber={contractSession?.contractId}
        isSaving={isSavingDraft}
        onConfirm={() => void handleConfirmSaveLater()}
      />
    </>
  );
}
