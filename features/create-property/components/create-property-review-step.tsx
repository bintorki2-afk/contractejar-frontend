"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import CreatePropertyNameField from "@/features/create-property/components/create-property-name-field";
import CreatePropertyStepNavigation from "@/features/create-property/components/create-property-step-navigation";
import CreatePropertyStepPhaseHeader from "@/features/create-property/components/create-property-step-phase-header";
import { useCreatePropertyReviewStep } from "@/features/create-property/hooks/use-create-property-review-step";
import { useSubmitPropertyStep2 } from "@/features/create-property/hooks/use-submit-property-step2";
import type { CreatePropertyLabels } from "@/features/create-property/types/create-property-labels";

type CreatePropertyReviewStepProps = {
  labels: CreatePropertyLabels["review"];
  onBack: () => void;
  onComplete: (propertyId: number) => void;
};

export default function CreatePropertyReviewStep({
  labels,
  onBack,
  onComplete,
}: CreatePropertyReviewStepProps) {
  const tIncomplete = useTranslations("createProperty");
  const { reviewData, setReviewData, canContinue } =
    useCreatePropertyReviewStep();
  const { isSubmitting, submitStep2 } = useSubmitPropertyStep2();
  const [showFieldErrors, setShowFieldErrors] = useState(false);

  async function handleContinue() {
    if (isSubmitting) {
      return;
    }

    if (!canContinue) {
      setShowFieldErrors(true);
      toast.error(tIncomplete("incompleteContinue"));
      return;
    }

    setShowFieldErrors(false);

    const result = await submitStep2();

    if (!result.ok) {
      toast.error(result.error || labels.navigation.submitError);
      return;
    }

    onComplete(result.propertyId);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-b-[28px] bg-white p-3 md:p-5 dark:bg-[#1a2421]">
        <CreatePropertyStepPhaseHeader
          title={labels.title}
          subtitle={labels.subtitle}
        />

        <CreatePropertyNameField
          label={labels.propertyName.label}
          placeholder={labels.propertyName.placeholder}
          hint={labels.propertyName.hint}
          example={labels.propertyName.example}
          value={reviewData.propertyName}
          onChange={(propertyName) =>
            setReviewData({ ...reviewData, propertyName })
          }
          invalid={showFieldErrors && reviewData.propertyName.trim() === ""}
          valid={reviewData.propertyName.trim() !== ""}
        />

        <CreatePropertyStepNavigation
          previousLabel={labels.navigation.previous}
          continueLabel={
            isSubmitting
              ? labels.navigation.submitting
              : labels.navigation.continue
          }
          isSubmitting={isSubmitting}
          onPrevious={onBack}
          onContinue={handleContinue}
        />
      </div>
    </div>
  );
}
