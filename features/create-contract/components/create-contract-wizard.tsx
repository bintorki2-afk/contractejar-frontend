"use client";

import { useEffect } from "react";

import CreateContractDeedStep from "@/features/create-contract/components/create-contract-deed-step";
import CreateContractFixMode, {
  type CreateContractFixParams,
} from "@/features/create-contract/components/create-contract-fix-mode";
import CreateContractFinanceStep from "@/features/create-contract/components/create-contract-finance-step";
import CreateContractHeader from "@/features/create-contract/components/create-contract-header";
import CreateContractIntroStep from "@/features/create-contract/components/create-contract-intro-step";
import CreateContractOwnerStep from "@/features/create-contract/components/create-contract-owner-step";
import CreateContractSubmitStep from "@/features/create-contract/components/create-contract-submit-step";
import CreateContractTenantStep from "@/features/create-contract/components/create-contract-tenant-step";
import CreateContractStepper from "@/features/create-contract/components/create-contract-stepper";
import { useCreateContractSteps } from "@/features/create-contract/hooks/use-create-contract-steps";
import { useStartFreshContract } from "@/features/create-contract/hooks/use-start-fresh-contract";
import {
  trackWizardStart,
  useWizardAnalytics,
} from "@/features/create-contract/hooks/use-wizard-analytics";
import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import type { ContractTypeId } from "@/features/create-contract/types/contract-type";
import { isOwnerStepSkipped } from "@/features/create-contract/utils/is-owner-step-skipped";
import {
  resetCreateContractDraft,
  resetCreateContractDraftIfScheduledOnUnmount,
} from "@/features/create-contract/utils/reset-create-contract-draft";
import CreateFlowDraftHydrator from "@/features/shared/components/create-flow-draft-hydrator";
import { usePersistStoreHydrated } from "@/features/shared/hooks/use-persist-store-hydrated";

type CreateContractWizardProps = {
  labels: CreateContractLabels;
  contractType: ContractTypeId;
  /** دفعة هـ (E4): عند وجوده يُعرض وضع التصحيح بدل المعالج الكامل. */
  fix?: CreateContractFixParams | null;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
};

export default function CreateContractWizard({
  labels,
  contractType,
  fix = null,
  isDarkMode = false,
  onToggleDarkMode,
}: CreateContractWizardProps) {
  if (fix) {
    return (
      <CreateContractFixMode
        labels={labels}
        contractType={contractType}
        fix={fix}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
      />
    );
  }

  return (
    <CreateContractFullWizard
      labels={labels}
      contractType={contractType}
      isDarkMode={isDarkMode}
      onToggleDarkMode={onToggleDarkMode}
    />
  );
}

function CreateContractFullWizard({
  labels,
  contractType,
  isDarkMode = false,
  onToggleDarkMode,
}: Omit<CreateContractWizardProps, "fix">) {
  const { currentStep, goNext, goBack, goToStep } = useCreateContractSteps();
  const { handleStart: startFreshContract, isStarting } = useStartFreshContract(contractType);
  // GTM: wizard_start / wizard_step (docs/analytics-events.md).
  useWizardAnalytics(contractType);
  function handleStart() {
    trackWizardStart(contractType);
    startFreshContract();
  }
  const isDraftHydrated = usePersistStoreHydrated(
    useCreateContractDraftStore.persist,
  );
  const hydrateFilesFromPersisted = useCreateContractDraftStore(
    (state) => state.hydrateFilesFromPersisted,
  );
  const selectedDeedType = useCreateContractDraftStore(
    (state) => state.deed.selectedDeedType,
  );
  const instrumentType = useCreateContractDraftStore(
    (state) => state.contractStep1Data?.instrument_type,
  );
  const skipOwnerToTenant = useCreateContractDraftStore(
    (state) => state.skipOwnerToTenant,
  );
  // A fix-mode draft left behind (customer navigated away mid-correction) is
  // not a new order: clear it so the full wizard starts clean.
  const staleFixMode = useCreateContractDraftStore((state) => state.fixMode);
  useEffect(() => {
    if (isDraftHydrated && staleFixMode) {
      const store = useCreateContractDraftStore.getState();
      store.setFixMode(null);
      store.resetDraft();
    }
  }, [isDraftHydrated, staleFixMode]);
  const ownerSkipped = isOwnerStepSkipped({
    selectedDeedType,
    instrumentType,
  });
  const pageTitle =
    contractType === "residential"
      ? labels.pageTitleResidential
      : labels.pageTitleCommercial;

  useEffect(() => {
    return () => {
      resetCreateContractDraftIfScheduledOnUnmount();

      const { currentStep } = useCreateContractDraftStore.getState();

      if (currentStep === "payment") {
        resetCreateContractDraft();
      }
    };
  }, []);

  useEffect(() => {
    if (currentStep === "owner" && ownerSkipped) {
      skipOwnerToTenant();
    }
  }, [currentStep, ownerSkipped, skipOwnerToTenant]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-2">
      <CreateFlowDraftHydrator hydrate={hydrateFilesFromPersisted} />

      <CreateContractHeader
        pageTitle={pageTitle}
        labels={labels.header}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode ?? (() => undefined)}
      />

      <div>
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm dark:border dark:border-[#2f403b] dark:bg-[#1a2421]">
          {isDraftHydrated ? (
            <>
              <CreateContractStepper labels={labels.stepper} />

              {currentStep === "intro" ? (
                <CreateContractIntroStep
                  labels={labels.intro}
                  stepperLabels={labels.stepper}
                  contractType={contractType}
                  prices={labels.prices}
                  onStart={handleStart}
                  isStarting={isStarting}
                />
              ) : null}

              {currentStep === "deed" ? (
                <CreateContractDeedStep
                  labels={labels.deed}
                  onBack={goBack}
                  onComplete={goNext}
                />
              ) : null}

              {currentStep === "owner" && !ownerSkipped ? (
                <CreateContractOwnerStep
                  labels={labels.owner}
                  onBack={goBack}
                  onComplete={goNext}
                />
              ) : null}

              {currentStep === "tenant" ? (
                <CreateContractTenantStep
                  labels={labels.tenant}
                  contractType={contractType}
                  onBack={goBack}
                  onComplete={goNext}
                />
              ) : null}

              {currentStep === "finance" ? (
                <CreateContractFinanceStep
                  labels={labels.finance}
                  summaryLabels={labels.payment.summary}
                  contractType={contractType}
                  onBack={goBack}
                  onComplete={goNext}
                />
              ) : null}

              {currentStep === "payment" ? (
                <CreateContractSubmitStep
                  reviewLabels={labels.payment.reviewDialog}
                  paymentLabels={labels.payment}
                  saveLaterDialogLabels={labels.tenant.saveLaterDialog}
                  contractType={contractType}
                  deedTypeLabels={labels.deed.deedType.types}
                  deedAttachmentLabels={{
                    label: labels.deed.deedImage.label,
                    salePaperLabel: labels.deed.deedImage.salePaperLabel,
                    frontLabel: labels.deed.deedImage.frontLabel,
                    backLabel: labels.deed.deedImage.backLabel,
                    inheritanceLabel: labels.deed.deedImage.inheritanceLabel,
                    heirsPoaLabel: labels.deed.deedImage.heirsPoaLabel,
                    endowmentCertLabel: labels.deed.deedImage.endowmentCertLabel,
                    trusteeshipLabel: labels.deed.deedImage.trusteeshipLabel,
                    guardiansPoaLabel: labels.deed.deedImage.guardiansPoaLabel,
                    deceasedDeedLabel: labels.deed.deceased.deedLabel,
                    paperLabel: labels.deed.deedImage.paperLabel,
                    adversePossessionLabel:
                      labels.deed.deedImage.adversePossessionLabel,
                    economicCitiesLabel: labels.deed.deedImage.economicCitiesLabel,
                  }}
                  onBack={goBack}
                  onEditStep={goToStep}
                />
              ) : null}
            </>
          ) : (
            <div
              aria-busy="true"
              className="min-h-112 bg-white dark:bg-[#1a2421]"
            />
          )}
        </div>
      </div>
    </div>
  );
}
