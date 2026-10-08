"use client";

import { CalendarDays, FileText, IdCard } from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import CreateContractBirthDateFields from "@/features/create-contract/components/create-contract-birth-date-fields";
import CreateContractDeedImageUpload from "@/features/create-contract/components/create-contract-deed-image-upload";
import CreateContractFieldLabel from "@/features/create-contract/components/create-contract-field-label";
import CreateContractIconInputField from "@/features/create-contract/components/create-contract-icon-input-field";
import CreateContractSaudiMobileField from "@/features/create-contract/components/create-contract-saudi-mobile-field";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import type { AgentDataState } from "@/features/create-contract/types/owner-step";
import {
  getIdNumberFieldError,
  getPhoneFieldError,
  isPhoneComplete,
} from "@/lib/validation/owner-step-validation";
import { isAdultBirthDateComplete } from "@/lib/validation/birth-date-year-options";
import { toSaudiMobileInputValue } from "@/lib/validation/format-saudi-mobile-for-form";
import { cn } from "@/lib/utils";
import { digitsOnly } from "@/lib/utils/digits";

type CreateContractAgentDataPhaseProps = {
  labels: CreateContractLabels["owner"]["agentData"];
  birthDateLabels: CreateContractLabels["owner"]["birthDate"];
  validationLabels: CreateContractLabels["owner"]["validation"]["fieldErrors"];
  value: AgentDataState;
  onChange: (value: AgentDataState) => void;
  showFieldErrors?: boolean;
  /** Representative mode (deceased/waqf) collects a capacity document, not a PoA. */
  hidePoaFields?: boolean;
  /** "page": the section heading is the step's only heading (representative mode). */
  headingVariant?: "section" | "page";
};

function isIdNumberComplete(idNumber: string) {
  return digitsOnly(idNumber).length === 10;
}

export default function CreateContractAgentDataPhase({
  labels,
  birthDateLabels,
  validationLabels,
  value,
  onChange,
  showFieldErrors = false,
  hidePoaFields = false,
  headingVariant = "section",
}: CreateContractAgentDataPhaseProps) {
  const t = useTranslations("createContract");

  function updateField<K extends keyof AgentDataState>(
    field: K,
    fieldValue: AgentDataState[K],
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  // Empty required fields get an explicit message once "continue" was pressed
  // (not only a red border), like the tenant step.
  const idNumberError = getIdNumberFieldError(
    value.idNumber,
    {
      required: t("fieldRequired"),
      length: validationLabels.idNumberLength,
    },
    { showEmpty: showFieldErrors },
  );
  const phoneError = getPhoneFieldError(
    value.phone,
    {
      required: t("fieldRequired"),
      length: validationLabels.phoneLength,
    },
    { showEmpty: showFieldErrors },
  );
  const idInvalid =
    Boolean(idNumberError) || (showFieldErrors && !isIdNumberComplete(value.idNumber));
  const phoneInvalid =
    Boolean(phoneError) || (showFieldErrors && !isPhoneComplete(value.phone));
  const birthDateInvalid = showFieldErrors && !isAdultBirthDateComplete(value.birthDate);
  const powerOfAttorneyInvalid =
    showFieldErrors && value.powerOfAttorneyFiles.length === 0;
  const poaNumberInvalid = showFieldErrors && value.poaNumber.trim() === "";
  const poaDateInvalid = showFieldErrors && value.poaDate.trim() === "";
  const idValid = !idInvalid && isIdNumberComplete(value.idNumber);
  const phoneValid = !phoneInvalid && isPhoneComplete(value.phone);

  return (
    <div className="space-y-3">
      <div className={cn("space-y-1 text-center", headingVariant === "page" && "mb-3")}>
        <h3
          className={cn(
            "font-extrabold text-brand",
            headingVariant === "page"
              ? "text-xl md:text-2xl"
              : "text-lg md:text-xl",
          )}
        >
          {labels.sectionTitle}
        </h3>
        <p className="text-sm text-[#9a9a9a]">{labels.sectionDescription}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CreateContractIconInputField
          label={labels.idNumber.label}
          placeholder={labels.idNumber.placeholder}
          value={value.idNumber}
          onChange={(idNumber) =>
            updateField("idNumber", digitsOnly(idNumber).slice(0, 10))
          }
          icon={IdCard}
          dir="ltr"
          inputMode="numeric"
          maxLength={10}
          errorMessage={idNumberError}
          invalid={idInvalid}
          valid={idValid}
        />

        <CreateContractSaudiMobileField
          label={labels.phone.label}
          placeholder={labels.phone.placeholder}
          value={value.phone}
          onChange={(phone) =>
            updateField("phone", toSaudiMobileInputValue(phone))
          }
          errorMessage={phoneError}
          invalid={phoneInvalid}
          valid={phoneValid}
        />
      </div>

      <CreateContractBirthDateFields
        labels={{
          ...birthDateLabels,
          label: labels.birthDateLabel,
        }}
        value={value.birthDate}
        onChange={(birthDate) => updateField("birthDate", birthDate)}
        invalid={birthDateInvalid}
      />

      {hidePoaFields ? null : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CreateContractIconInputField
            label={labels.poaNumber.label}
            placeholder={labels.poaNumber.placeholder}
            value={value.poaNumber}
            onChange={(poaNumber) => updateField("poaNumber", poaNumber)}
            icon={FileText}
            dir="ltr"
            errorMessage={poaNumberInvalid ? t("fieldRequired") : undefined}
            invalid={poaNumberInvalid}
          />

          <div>
            <CreateContractFieldLabel
              label={labels.poaDate.label}
              invalid={poaDateInvalid}
            />
            <div
              className={cn(
                "flex h-10 w-full items-center gap-2 rounded-2xl border px-2",
                poaDateInvalid ? "border-[#e57373] bg-white" : "border-[#e8e8e8] bg-white",
              )}
            >
              <span className="inline-flex size-10 shrink-0 items-center justify-center text-[#9a9a9a]">
                <CalendarDays className="size-5" aria-hidden="true" />
              </span>
              <span className="h-6 w-px shrink-0 bg-[#dcdcdc]" aria-hidden="true" />
              <Input
                type="date"
                dir="ltr"
                value={value.poaDate}
                onChange={(event) => updateField("poaDate", event.target.value)}
                aria-invalid={poaDateInvalid}
                className="h-auto border-0 bg-transparent px-2 text-sm shadow-none focus-visible:ring-0"
              />
            </div>
            {poaDateInvalid ? (
              <p className="mt-1.5 text-xs font-medium text-[#c62828]">
                {t("fieldRequired")}
              </p>
            ) : null}
          </div>
        </div>
      )}

      <CreateContractDeedImageUpload
        labels={labels.powerOfAttorney}
        value={value.powerOfAttorneyFiles}
        onChange={(powerOfAttorneyFiles) =>
          updateField("powerOfAttorneyFiles", powerOfAttorneyFiles)
        }
        invalid={powerOfAttorneyInvalid}
        single
        variant="dashed"
      />

      <p className="text-xs leading-6 text-[#9a9a9a]">{labels.footerNote}</p>
    </div>
  );
}
