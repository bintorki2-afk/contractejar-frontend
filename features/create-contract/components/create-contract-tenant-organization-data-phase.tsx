"use client";

import { FilePenLine, IdCard } from "lucide-react";
import { useTranslations } from "next-intl";

import CreateContractBirthDateFields from "@/features/create-contract/components/create-contract-birth-date-fields";
import CreateContractDeedImageUpload from "@/features/create-contract/components/create-contract-deed-image-upload";
import CreateContractIconInputField from "@/features/create-contract/components/create-contract-icon-input-field";
import CreateContractSaudiMobileField from "@/features/create-contract/components/create-contract-saudi-mobile-field";
import CreateContractTenantDelegationTypeSelect from "@/features/create-contract/components/create-contract-tenant-delegation-type-select";
import CreateContractUnifiedRecordNumberField from "@/features/create-contract/components/create-contract-unified-record-number-field";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import type { OrganizationTenantData } from "@/features/create-contract/types/tenant-step";
import { isPhoneComplete } from "@/lib/validation/owner-step-validation";
import { isAdultBirthDateComplete } from "@/lib/validation/birth-date-year-options";
import {
  isUnifiedRecordNumberPrefixOnly,
  UNIFIED_RECORD_NUMBER_LENGTH,
} from "@/lib/validation/format-unified-record-number-for-form";
import { toSaudiMobileInputValue } from "@/lib/validation/format-saudi-mobile-for-form";
import { digitsOnly } from "@/lib/utils/digits";

type CreateContractTenantOrganizationDataPhaseProps = {
  labels: CreateContractLabels["tenant"]["organizationData"];
  birthDateLabels: CreateContractLabels["tenant"]["birthDate"];
  value: OrganizationTenantData;
  onChange: (value: OrganizationTenantData) => void;
  showFieldErrors?: boolean;
};

function isIdNumberComplete(idNumber: string) {
  return digitsOnly(idNumber).length === 10;
}

function isUnifiedRecordNumberComplete(unifiedRecordNumber: string) {
  if (isUnifiedRecordNumberPrefixOnly(unifiedRecordNumber)) {
    return false;
  }

  const digits = digitsOnly(unifiedRecordNumber);
  return digits.length === UNIFIED_RECORD_NUMBER_LENGTH && digits.startsWith("7");
}

export default function CreateContractTenantOrganizationDataPhase({
  labels,
  birthDateLabels,
  value,
  onChange,
  showFieldErrors = false,
}: CreateContractTenantOrganizationDataPhaseProps) {
  const t = useTranslations("createContract");

  function updateField<K extends keyof OrganizationTenantData>(
    field: K,
    fieldValue: OrganizationTenantData[K],
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  function updateDelegationType(
    delegationType: OrganizationTenantData["delegationType"],
  ) {
    onChange({
      ...value,
      delegationType,
      powerOfAttorneyFiles:
        delegationType === "agent-authorized"
          ? value.powerOfAttorneyFiles
          : [],
    });
  }

  const delegationType = value.delegationType || "owner-representative";

  return (
    <div className="mt-3 space-y-3">
      <CreateContractTenantDelegationTypeSelect
        labels={labels.delegationType}
        value={delegationType}
        onChange={updateDelegationType}
        invalid={showFieldErrors && value.delegationType === ""}
      />

      <CreateContractUnifiedRecordNumberField
        label={labels.unifiedRecordNumber.label}
        placeholder={labels.unifiedRecordNumber.placeholder}
        hint={labels.unifiedRecordNumber.hint}
        value={value.unifiedRecordNumber}
        onChange={(unifiedRecordNumber) =>
          updateField("unifiedRecordNumber", unifiedRecordNumber)
        }
        icon={FilePenLine}
        errorMessage={
          showFieldErrors &&
          !isUnifiedRecordNumberComplete(value.unifiedRecordNumber)
            ? t("fieldRequired")
            : undefined
        }
        valid={isUnifiedRecordNumberComplete(value.unifiedRecordNumber)}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CreateContractIconInputField
          label={labels.ownerIdNumber.label}
          placeholder={labels.ownerIdNumber.placeholder}
          value={value.ownerIdNumber}
          onChange={(ownerIdNumber) =>
            updateField(
              "ownerIdNumber",
              digitsOnly(ownerIdNumber).slice(0, 10),
            )
          }
          icon={IdCard}
          dir="ltr"
          inputMode="numeric"
          maxLength={10}
          errorMessage={
            showFieldErrors && !isIdNumberComplete(value.ownerIdNumber)
              ? t("fieldRequired")
              : undefined
          }
          valid={isIdNumberComplete(value.ownerIdNumber)}
        />

        <CreateContractSaudiMobileField
          label={labels.ownerPhone.label}
          placeholder={labels.ownerPhone.placeholder}
          value={value.ownerPhone}
          onChange={(ownerPhone) =>
            updateField("ownerPhone", toSaudiMobileInputValue(ownerPhone))
          }
          errorMessage={
            showFieldErrors && !isPhoneComplete(value.ownerPhone)
              ? t("fieldRequired")
              : undefined
          }
          valid={isPhoneComplete(value.ownerPhone)}
        />
      </div>

      <CreateContractBirthDateFields
        labels={{
          ...birthDateLabels,
          label: labels.ownerBirthDateLabel,
        }}
        value={value.ownerBirthDate}
        onChange={(ownerBirthDate) =>
          updateField("ownerBirthDate", ownerBirthDate)
        }
        invalid={
          showFieldErrors && !isAdultBirthDateComplete(value.ownerBirthDate)
        }
      />

      {delegationType === "agent-authorized" ? (
        <CreateContractDeedImageUpload
          labels={labels.powerOfAttorney}
          value={value.powerOfAttorneyFiles}
          onChange={(powerOfAttorneyFiles) =>
            updateField("powerOfAttorneyFiles", powerOfAttorneyFiles)
          }
          invalid={showFieldErrors && value.powerOfAttorneyFiles.length === 0}
          single
          variant="dashed"
          hint={labels.powerOfAttorney.hint}
        />
      ) : null}
    </div>
  );
}
