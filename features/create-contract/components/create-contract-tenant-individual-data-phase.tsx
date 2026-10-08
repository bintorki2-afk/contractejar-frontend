"use client";

import { IdCard } from "lucide-react";
import { useTranslations } from "next-intl";

import CreateContractBirthDateFields from "@/features/create-contract/components/create-contract-birth-date-fields";
import CreateContractIconInputField from "@/features/create-contract/components/create-contract-icon-input-field";
import CreateContractSaudiMobileField from "@/features/create-contract/components/create-contract-saudi-mobile-field";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import type { IndividualTenantData } from "@/features/create-contract/types/tenant-step";
import { isPhoneComplete } from "@/lib/validation/owner-step-validation";
import { isAdultBirthDateComplete } from "@/lib/validation/birth-date-year-options";
import { toSaudiMobileInputValue } from "@/lib/validation/format-saudi-mobile-for-form";
import { digitsOnly } from "@/lib/utils/digits";

type CreateContractTenantIndividualDataPhaseProps = {
  labels: CreateContractLabels["tenant"]["individualData"];
  birthDateLabels: CreateContractLabels["tenant"]["birthDate"];
  value: IndividualTenantData;
  onChange: (value: IndividualTenantData) => void;
  showFieldErrors?: boolean;
};

function isIdNumberComplete(idNumber: string) {
  return digitsOnly(idNumber).length === 10;
}

export default function CreateContractTenantIndividualDataPhase({
  labels,
  birthDateLabels,
  value,
  onChange,
  showFieldErrors = false,
}: CreateContractTenantIndividualDataPhaseProps) {
  const t = useTranslations("createContract");

  function updateField<K extends keyof IndividualTenantData>(
    field: K,
    fieldValue: IndividualTenantData[K],
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          errorMessage={
            showFieldErrors && !isIdNumberComplete(value.idNumber)
              ? t("fieldRequired")
              : undefined
          }
          valid={isIdNumberComplete(value.idNumber)}
        />

        <CreateContractSaudiMobileField
          label={labels.phone.label}
          placeholder={labels.phone.placeholder}
          value={value.phone}
          onChange={(phone) =>
            updateField("phone", toSaudiMobileInputValue(phone))
          }
          errorMessage={
            showFieldErrors && !isPhoneComplete(value.phone)
              ? t("fieldRequired")
              : undefined
          }
          valid={isPhoneComplete(value.phone)}
        />
      </div>

      <CreateContractBirthDateFields
        labels={birthDateLabels}
        value={value.birthDate}
        onChange={(birthDate) => updateField("birthDate", birthDate)}
        invalid={showFieldErrors && !isAdultBirthDateComplete(value.birthDate)}
      />
    </div>
  );
}
