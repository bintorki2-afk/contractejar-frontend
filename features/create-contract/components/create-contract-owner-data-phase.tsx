"use client";

import { IdCard } from "lucide-react";
import { useTranslations } from "next-intl";

import { Switch } from "@/components/ui/switch";
import CreateContractBirthDateFields from "@/features/create-contract/components/create-contract-birth-date-fields";
import CreateContractIconInputField from "@/features/create-contract/components/create-contract-icon-input-field";
import CreateContractSaudiMobileField from "@/features/create-contract/components/create-contract-saudi-mobile-field";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import type { OwnerDataState } from "@/features/create-contract/types/owner-step";
import {
  getIdNumberFieldError,
  getPhoneFieldError,
  isPhoneComplete,
} from "@/lib/validation/owner-step-validation";
import { isAdultBirthDateComplete } from "@/lib/validation/birth-date-year-options";
import { toSaudiMobileInputValue } from "@/lib/validation/format-saudi-mobile-for-form";
import { cn } from "@/lib/utils";
import { digitsOnly } from "@/lib/utils/digits";

type CreateContractOwnerDataPhaseProps = {
  labels: CreateContractLabels["owner"]["ownerData"];
  birthDateLabels: CreateContractLabels["owner"]["birthDate"];
  validationLabels: CreateContractLabels["owner"]["validation"]["fieldErrors"];
  value: OwnerDataState;
  onChange: (value: OwnerDataState) => void;
  showFieldErrors?: boolean;
};

function isIdNumberComplete(idNumber: string) {
  return digitsOnly(idNumber).length === 10;
}

export default function CreateContractOwnerDataPhase({
  labels,
  birthDateLabels,
  validationLabels,
  value,
  onChange,
  showFieldErrors = false,
}: CreateContractOwnerDataPhaseProps) {
  const t = useTranslations("createContract");

  function updateField<K extends keyof OwnerDataState>(
    field: K,
    fieldValue: OwnerDataState[K],
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
    { showEmpty: showFieldErrors, allowEstablishment: true },
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
  const birthDateInvalid =
    showFieldErrors && !isAdultBirthDateComplete(value.birthDate);
  const hasAgentInvalid = showFieldErrors && value.hasAgent === "";
  const hasAgentChecked = value.hasAgent === "yes";
  const idValid = !idInvalid && isIdNumberComplete(value.idNumber);
  const phoneValid = !phoneInvalid && isPhoneComplete(value.phone);

  return (
    <div className="space-y-3">
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
        labels={birthDateLabels}
        value={value.birthDate}
        onChange={(birthDate) => updateField("birthDate", birthDate)}
        invalid={birthDateInvalid}
      />

      <label
        className={cn(
          "flex cursor-pointer items-center justify-between gap-4 rounded-2xl border px-4 py-4",
          hasAgentInvalid
            ? "border-[#e57373] bg-white"
            : hasAgentChecked
              ? "border-brand bg-brand-background-green"
              : "border-[#e8e8e8] bg-white",
        )}
      >
        <span className="min-w-0 space-y-1 text-start">
          <span
            className={cn(
              "block text-sm font-bold",
              hasAgentInvalid ? "text-[#c62828]" : "text-black",
            )}
          >
            {labels.hasAgent.title}
          </span>
          <span className="block text-xs leading-5 text-[#9a9a9a]">
            {labels.hasAgent.description}
          </span>
        </span>
        <Switch
          dir="ltr"
          checked={hasAgentChecked}
          onCheckedChange={(checked) =>
            updateField("hasAgent", checked ? "yes" : "no")
          }
          aria-invalid={hasAgentInvalid}
          className="h-6 w-11 shrink-0 data-checked:bg-brand data-unchecked:bg-[#d9d9d9]"
        />
      </label>
    </div>
  );
}
