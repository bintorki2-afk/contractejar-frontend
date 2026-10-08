"use client";

import { IdCard } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import CreatePropertyBirthDateFields from "@/features/create-property/components/create-property-birth-date-fields";
import CreatePropertyIconInputField from "@/features/create-property/components/create-property-icon-input-field";
import CreatePropertySaudiMobileField from "@/features/create-property/components/create-property-saudi-mobile-field";
import type { CreatePropertyLabels } from "@/features/create-property/types/create-property-labels";
import type { PropertyOwnerDataState } from "@/features/create-property/types/owner-step";
import {
  getIdNumberFieldError,
  getPhoneFieldError,
  isPhoneComplete,
} from "@/lib/validation/owner-step-validation";
import { isAdultBirthDateComplete } from "@/lib/validation/birth-date-year-options";
import { toSaudiMobileInputValue } from "@/lib/validation/format-saudi-mobile-for-form";
import { cn } from "@/lib/utils";

type CreatePropertyOwnerDataPhaseProps = {
  labels: CreatePropertyLabels["owner"]["ownerData"];
  birthDateLabels: CreatePropertyLabels["owner"]["birthDate"];
  validationLabels: CreatePropertyLabels["owner"]["validation"]["fieldErrors"];
  value: PropertyOwnerDataState;
  onChange: (value: PropertyOwnerDataState) => void;
  showFieldErrors?: boolean;
};

function isIdNumberComplete(idNumber: string) {
  return idNumber.replace(/[٠-٩۰-۹]/g, (d) => "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹".indexOf(d) % 10 + "").replace(/\D/g, "").length === 10;
}

export default function CreatePropertyOwnerDataPhase({
  labels,
  birthDateLabels,
  validationLabels,
  value,
  onChange,
  showFieldErrors = false,
}: CreatePropertyOwnerDataPhaseProps) {
  function updateField<K extends keyof PropertyOwnerDataState>(
    field: K,
    fieldValue: PropertyOwnerDataState[K],
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  const idNumberError = getIdNumberFieldError(value.idNumber, {
    required: validationLabels.idNumberLength,
    length: validationLabels.idNumberLength,
  }, { allowEstablishment: true });
  const phoneError = getPhoneFieldError(value.phone, {
    required: validationLabels.phoneLength,
    length: validationLabels.phoneLength,
  });
  const idInvalid =
    Boolean(idNumberError) ||
    (showFieldErrors && !isIdNumberComplete(value.idNumber));
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
        <CreatePropertyIconInputField
          label={labels.idNumber.label}
          placeholder={labels.idNumber.placeholder}
          value={value.idNumber}
          onChange={(idNumber) =>
            updateField("idNumber", idNumber.replace(/[٠-٩۰-۹]/g, (d) => "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹".indexOf(d) % 10 + "").replace(/\D/g, "").slice(0, 10))
          }
          icon={IdCard}
          dir="ltr"
          inputMode="numeric"
          maxLength={10}
          errorMessage={idNumberError}
          invalid={idInvalid}
          valid={idValid}
        />

        <CreatePropertySaudiMobileField
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

      <CreatePropertyBirthDateFields
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
          className="h-6 w-11 shrink-0 data-checked:bg-brand data-unchecked:bg-[#d9d9d9]"
        />
      </label>
    </div>
  );
}
