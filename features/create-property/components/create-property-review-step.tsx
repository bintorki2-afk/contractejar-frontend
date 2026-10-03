"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import CreatePropertyNameField from "@/features/create-property/components/create-property-name-field";
import CreatePropertyStepNavigation from "@/features/create-property/components/create-property-step-navigation";
import CreatePropertyStepPhaseHeader from "@/features/create-property/components/create-property-step-phase-header";
import { useCreatePropertyReviewStep } from "@/features/create-property/hooks/use-create-property-review-step";
import { useSubmitPropertyStep2 } from "@/features/create-property/hooks/use-submit-property-step2";
import { resetCreatePropertyDraft } from "@/features/create-property/utils/reset-create-property-draft";
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
  const router = useRouter();
  const { reviewData, setReviewData, canContinue } =
    useCreatePropertyReviewStep();
  const { isSubmitting, submitStep2 } = useSubmitPropertyStep2();
  const [showFieldErrors, setShowFieldErrors] = useState(false);

  // Validate (name + earlier stages) then actually persist the property. Returns
  // the submit result on success, or null when blocked/failed — so both the
  // "save" and "continue" buttons genuinely save instead of pretending to.
  async function persistProperty() {
    if (isSubmitting) {
      return null;
    }

    if (!canContinue) {
      setShowFieldErrors(true);
      toast.error(tIncomplete("incompleteContinue"));
      return null;
    }

    setShowFieldErrors(false);

    const result = await submitStep2();

    if (!result.ok) {
      toast.error(result.error || labels.navigation.submitError);
      return null;
    }

    return result;
  }

  async function handleContinue() {
    const result = await persistProperty();
    if (result) {
      onComplete(result.propertyId);
    }
  }

  async function handleSave() {
    const result = await persistProperty();
    if (result) {
      toast.success(labels.navigation.saveSuccess);
      resetCreatePropertyDraft();
      router.push("/properties/my-properties");
    }
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
          saveLabel={labels.navigation.save}
          continueLabel={
            isSubmitting
              ? labels.navigation.submitting
              : labels.navigation.continue
          }
          isSubmitting={isSubmitting}
          onPrevious={onBack}
          onSave={handleSave}
          onContinue={handleContinue}
        />
      </div>
    </div>
  );
}
