"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import CreateContractAgentDataPhase from "@/features/create-contract/components/create-contract-agent-data-phase";
import CreateContractOwnerDataPhase from "@/features/create-contract/components/create-contract-owner-data-phase";
import CreateContractStepNavigation from "@/features/create-contract/components/create-contract-step-navigation";
import CreateContractStepPhaseHeader from "@/features/create-contract/components/create-contract-step-phase-header";
import { useCreateContractOwnerStep } from "@/features/create-contract/hooks/use-create-contract-owner-step";
import { useSubmitContractStep3 } from "@/features/create-contract/hooks/use-submit-contract-step3";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import { scrollToFirstInvalidField } from "@/features/shared/utils/scroll-to-first-invalid-field";

type CreateContractOwnerStepProps = {
  labels: CreateContractLabels["owner"];
  onBack: () => void;
  onComplete: () => void;
};

export default function CreateContractOwnerStep({
  labels,
  onBack,
  onComplete,
}: CreateContractOwnerStepProps) {
  const t = useTranslations("createContract");
  const {
    ownerData,
    setOwnerData,
    agentData,
    setAgentData,
    canContinue,
    representativeMode,
  } = useCreateContractOwnerStep();
  const { submitStep3, isSubmitting } = useSubmitContractStep3();
  const [showFieldErrors, setShowFieldErrors] = useState(false);

  const phase = labels.phases[0];
  const showAgentForm = ownerData.hasAgent === "yes";
  const isRepresentative = representativeMode !== null;

  // #30/#31: deceased-owner / waqf deeds collect the legal representative
  // (heirs' agent / waqf trustee) with a mandatory capacity document. Every
  // field is labelled after the representative («الناظر» / «وكيل الورثة»).
  const representativeFields =
    representativeMode === "waqf"
      ? labels.representative.waqfFields
      : labels.representative.deceasedFields;
  const representativeLabels = {
    ...labels.agentData,
    sectionTitle:
      representativeMode === "waqf"
        ? labels.representative.waqfSectionTitle
        : labels.representative.deceasedSectionTitle,
    sectionDescription:
      representativeMode === "waqf"
        ? labels.representative.waqfSectionDescription
        : labels.representative.deceasedSectionDescription,
    idNumber: {
      ...labels.agentData.idNumber,
      label: representativeFields.idNumber,
    },
    phone: {
      ...labels.agentData.phone,
      label: representativeFields.phone,
    },
    birthDateLabel: representativeFields.birthDate,
    powerOfAttorney: {
      ...labels.agentData.powerOfAttorney,
      label:
        representativeFields.capacityDocument ||
        labels.representative.capacityDocumentLabel,
    },
  };

  async function handleContinue() {
    if (isSubmitting) {
      return;
    }

    if (!canContinue) {
      setShowFieldErrors(true);
      toast.error(t("incompleteContinue"));
      setTimeout(scrollToFirstInvalidField, 0);
      return;
    }

    const submitted = await submitStep3({
      ownerData,
      agentData,
      representativeMode,
    });

    if (!submitted) {
      return;
    }

    onComplete();
  }

  return (
    <div className="space-y-4">
      <div className="p-3 md:p-5">
        {/* The representative section carries its own heading, so the generic
            «بيانات مالك العقار» header is only shown for a self owner. */}
        {isRepresentative ? null : (
          <CreateContractStepPhaseHeader
            title={phase.title}
            subtitle={phase.subtitle}
          />
        )}

        <div className="space-y-3">
          {isRepresentative ? (
            <CreateContractAgentDataPhase
              labels={representativeLabels}
              birthDateLabels={labels.birthDate}
              validationLabels={labels.validation.fieldErrors}
              value={agentData}
              onChange={setAgentData}
              showFieldErrors={showFieldErrors}
              hidePoaFields
              headingVariant="page"
            />
          ) : (
            <>
              <CreateContractOwnerDataPhase
                labels={labels.ownerData}
                birthDateLabels={labels.birthDate}
                validationLabels={labels.validation.fieldErrors}
                value={ownerData}
                onChange={setOwnerData}
                showFieldErrors={showFieldErrors}
              />

              {showAgentForm ? (
                <CreateContractAgentDataPhase
                  labels={labels.agentData}
                  birthDateLabels={labels.birthDate}
                  validationLabels={labels.validation.fieldErrors}
                  value={agentData}
                  onChange={setAgentData}
                  showFieldErrors={showFieldErrors}
                />
              ) : null}
            </>
          )}
        </div>

        <CreateContractStepNavigation
          previousLabel={labels.navigation.previous}
          continueLabel={
            isSubmitting
              ? labels.navigation.submitting
              : labels.navigation.continue
          }
          isSubmitting={isSubmitting}
          onPrevious={onBack}
          onContinue={() => void handleContinue()}
        />
      </div>
    </div>
  );
}
