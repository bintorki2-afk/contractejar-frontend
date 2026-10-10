"use client";

import {
  AirVent,
  Bath,
  BedDouble,
  CookingPot,
  Droplets,
  Fan,
  Hash,
  Zap,
} from "lucide-react";

import CreateUnitAreaField from "@/features/create-unit/components/create-unit-area-field";
import CreateUnitContractTypeCards from "@/features/create-unit/components/create-unit-contract-type-cards";
import CreateUnitFormSelect from "@/features/create-unit/components/create-unit-form-select";
import CreateUnitIconInputField from "@/features/create-unit/components/create-unit-icon-input-field";
import CreateUnitNumberField from "@/features/create-unit/components/create-unit-number-field";
import type { UnitLookupOption } from "@/features/create-unit/types/unit-option";
import {
  isPositiveNumber,
  isSelectFilled,
  isUnitNumberFilled,
  type UnitDataState,
} from "@/features/create-unit/types/unit-data";
import MeterRegistrationOptions from "@/features/shared/components/meter-registration-options";
import UnitAdditionalInfoSection from "@/features/shared/components/unit-form/unit-additional-info-section";
import UnitBasicSection from "@/features/shared/components/unit-form/unit-basic-section";
import UnitCountStepper from "@/features/shared/components/unit-form/unit-count-stepper";
import UnitOptionalCheckboxField from "@/features/shared/components/unit-form/unit-optional-checkbox-field";
import type { UnitFormLabels } from "@/features/shared/types/unit-form-labels";
import type { PropertyContractType } from "@/features/create-property/utils/contract-type";
import { cn } from "@/lib/utils";

type UnitTypeSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  notice?: string;
};

type UnitDataFormFieldsProps = {
  labels: UnitFormLabels;
  unitTypeOptions: UnitLookupOption[];
  /**
   * Pre-built options for the unit-type select. When provided they replace the
   * options derived from `unitTypeOptions` (used by the rented-unit step to sort
   * by contract type and disable the other contract type's options).
   */
  unitTypeSelectOptions?: UnitTypeSelectOption[];
  unitUsageOptions: UnitLookupOption[];
  value: UnitDataState;
  onChange: (value: UnitDataState) => void;
  contractType?: PropertyContractType;
  onContractTypeChange?: (contractType: PropertyContractType) => void;
  contractTypeSelectorVariant?: "select" | "cards";
  hideContractTypeSelector?: boolean;
  hideHousingOnlyFieldsForCommercial?: boolean;
  electricityMeterFee?: number;
  waterMeterFee?: number;
  /** Contract length in months when already chosen — for the shared-meter helper. */
  contractMonths?: number | null;
  showFieldErrors?: boolean;
  requireMeterRegistration?: boolean;
};

function toSelectOptions(options: UnitLookupOption[]) {
  return options.map((option) => ({
    value: String(option.id),
    label: option.name,
  }));
}

function FurnishingTypeToggle({
  label,
  newLabel,
  usedLabel,
  value,
  onChange,
}: {
  label: string;
  newLabel: string;
  usedLabel: string;
  value: "new" | "used" | "";
  onChange: (value: "new" | "used") => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-black dark:text-white">{label}</label>

      <div className="grid grid-cols-2 gap-3">
        {(["new", "used"] as const).map((furnishingType) => {
          const selected = value === furnishingType;

          return (
            <button
              key={furnishingType}
              type="button"
              onClick={() => onChange(furnishingType)}
              className={cn(
                "h-12 rounded-xl text-sm font-bold transition-colors",
                selected
                  ? "bg-brand text-white"
                  : "border border-[#e8e8e8] dark:border-[#262d2c] bg-white dark:bg-[#151c1b] text-[#b0b0b0] hover:border-[#d4d4d4] hover:text-[#8a8a8a] dark:text-[#6b7d78] dark:hover:border-[#3a4d47] dark:hover:text-[#9eb5af]",
              )}
            >
              {furnishingType === "new" ? newLabel : usedLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function UnitDataFormFields({
  labels,
  unitTypeOptions,
  unitTypeSelectOptions,
  unitUsageOptions,
  value,
  onChange,
  contractType,
  onContractTypeChange,
  contractTypeSelectorVariant = "select",
  hideContractTypeSelector = false,
  hideHousingOnlyFieldsForCommercial = false,
  electricityMeterFee = 0,
  waterMeterFee = 0,
  contractMonths = null,
  showFieldErrors = false,
  requireMeterRegistration = false,
}: UnitDataFormFieldsProps) {
  const requireMeters = showFieldErrors && requireMeterRegistration;
  const electricityMeterNumberInvalid =
    requireMeters &&
    value.addElectricityMeter &&
    value.electricityMeterNumber.trim() === "";
  const electricityMeterRegistrationInvalid =
    requireMeters &&
    value.addElectricityMeter &&
    value.electricityMeterRegistration === "";
  const electricitySharedFeeInvalid =
    requireMeters &&
    value.addElectricityMeter &&
    value.electricityMeterRegistration === "shared" &&
    !isPositiveNumber(value.electricitySharedMonthlyFee);
  const waterMeterNumberInvalid =
    requireMeters && value.addWaterMeter && value.waterMeterNumber.trim() === "";
  const waterMeterRegistrationInvalid =
    requireMeters && value.addWaterMeter && value.waterMeterRegistration === "";
  const waterSharedFeeInvalid =
    requireMeters &&
    value.addWaterMeter &&
    value.waterMeterRegistration === "shared" &&
    !isPositiveNumber(value.waterSharedMonthlyFee);
  const floorOptions = [
    { value: "ground", label: labels.floorOptions.ground },
    ...Array.from({ length: 50 }, (_, index) => {
      const floor = String(index + 1);
      return { value: floor, label: floor };
    }),
  ];

  function updateField<K extends keyof UnitDataState>(
    field: K,
    fieldValue: UnitDataState[K],
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  const contractTypeLabel =
    labels.contractType?.linkedLabel ?? labels.contractType?.label ?? "";
  const kitchensSelected = value.kitchensCount !== "";
  const showHousingOnlyFields =
    !hideHousingOnlyFieldsForCommercial || contractType !== "commercial";
  const useCardsSelector =
    contractTypeSelectorVariant === "cards" &&
    Boolean(labels.contractType?.descriptions);

  const basicFields = (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        <CreateUnitFormSelect
          label={labels.unitType.label}
          placeholder={labels.selectPlaceholder}
          options={unitTypeSelectOptions ?? toSelectOptions(unitTypeOptions)}
          value={value.unitTypeId}
          onChange={(unitTypeId) => updateField("unitTypeId", unitTypeId)}
          errorMessage={
            showFieldErrors && !isSelectFilled(value.unitTypeId)
              ? labels.fieldRequired
              : undefined
          }
        />

        <CreateUnitFormSelect
          label={labels.unitUsage.label}
          placeholder={labels.selectPlaceholder}
          options={toSelectOptions(unitUsageOptions)}
          value={value.unitUsageId}
          onChange={(unitUsageId) => updateField("unitUsageId", unitUsageId)}
          errorMessage={
            showFieldErrors && !isSelectFilled(value.unitUsageId)
              ? labels.fieldRequired
              : undefined
          }
        />

        <CreateUnitFormSelect
          label={labels.floorNumber.label}
          placeholder={labels.selectPlaceholder}
          options={floorOptions}
          value={value.floorNumber}
          onChange={(floorNumber) => updateField("floorNumber", floorNumber)}
          errorMessage={
            showFieldErrors && !isSelectFilled(value.floorNumber)
              ? labels.fieldRequired
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1.5fr_1fr] sm:gap-3">
        <CreateUnitNumberField
          label={labels.unitNumber.label}
          placeholder={labels.unitNumber.placeholder}
          value={value.unitNumber}
          onChange={(unitNumber) => updateField("unitNumber", unitNumber)}
          errorMessage={
            showFieldErrors && !isUnitNumberFilled(value.unitNumber)
              ? labels.fieldRequired
              : undefined
          }
        />

        <CreateUnitAreaField
          label={labels.totalArea.label}
          placeholder={labels.totalArea.placeholder}
          suffix={labels.totalArea.suffix}
          value={value.totalArea}
          onChange={(totalArea) => updateField("totalArea", totalArea)}
          errorMessage={
            showFieldErrors && !isPositiveNumber(value.totalArea)
              ? labels.fieldRequired
              : undefined
          }
        />
      </div>

      {showHousingOnlyFields ? (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-3">
            <UnitCountStepper
              label={labels.roomsCount.label}
              icon={<BedDouble className="size-4 text-brand-secondary" aria-hidden />}
              value={value.roomsCount}
              onChange={(roomsCount) => updateField("roomsCount", roomsCount)}
            />
            <UnitCountStepper
              label={labels.bathroomsCount.label}
              icon={<Bath className="size-4 text-[#3b82f6]" aria-hidden />}
              value={value.bathroomsCount}
              onChange={(bathroomsCount) =>
                updateField("bathroomsCount", bathroomsCount)
              }
            />
            <UnitCountStepper
              label={labels.kitchensCount.label}
              icon={<CookingPot className="size-4 text-[#e39b2d]" aria-hidden />}
              value={value.kitchensCount}
              onChange={(kitchensCount) =>
                onChange({
                  ...value,
                  kitchensCount,
                  kitchenCabinetsInstalled:
                    kitchensCount === ""
                      ? false
                      : value.kitchenCabinetsInstalled,
                })
              }
            />
          </div>

          {labels.roomsCount.hint ? (
            <p className="flex items-start gap-2 text-xs leading-5 text-[#9a9a9a] dark:text-white/50">
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-secondary"
                aria-hidden="true"
              />
              <span>{labels.roomsCount.hint}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );

  return (
    <div className="space-y-3">
      {!hideContractTypeSelector && labels.contractType && contractType && useCardsSelector ? (
        <CreateUnitContractTypeCards
          label={contractTypeLabel}
          value={contractType}
          onChange={onContractTypeChange}
          options={{
            housing: {
              title: labels.contractType.options.housing,
              description: labels.contractType.descriptions!.housing,
            },
            commercial: {
              title: labels.contractType.options.commercial,
              description: labels.contractType.descriptions!.commercial,
            },
          }}
        />
      ) : null}

      {!hideContractTypeSelector && labels.contractType && contractType && !useCardsSelector && !onContractTypeChange ? (
        <div>
          <label className="mb-1 block text-sm font-semibold text-black dark:text-white">
            {contractTypeLabel}
          </label>

          <div className="flex h-10 w-full items-center rounded-full border border-[#e8e8e8] bg-[#FBFBFA] px-4 dark:border-[#2f403b] dark:bg-[#0d1614]">
            <span className="text-sm font-semibold text-[#333333] dark:text-white">
              {contractType === "housing"
                ? labels.contractType.options.housing
                : labels.contractType.options.commercial}
            </span>
          </div>
        </div>
      ) : null}

      {!hideContractTypeSelector && labels.contractType &&
      contractType &&
      !useCardsSelector &&
      onContractTypeChange ? (
        <CreateUnitFormSelect
          label={contractTypeLabel}
          placeholder={labels.selectPlaceholder}
          options={[
            { value: "housing", label: labels.contractType.options.housing },
            {
              value: "commercial",
              label: labels.contractType.options.commercial,
            },
          ]}
          value={contractType}
          onChange={(nextValue) =>
            onContractTypeChange(nextValue as PropertyContractType)
          }
        />
      ) : null}

      {labels.unitCardTitle ? (
        <UnitBasicSection title={labels.unitCardTitle}>
          {basicFields}
        </UnitBasicSection>
      ) : (
        <div className="space-y-4">{basicFields}</div>
      )}

      <UnitAdditionalInfoSection
        toggleLabel={labels.additionalInfo.toggle}
        defaultOpen={false}
      >
        <div className="grid grid-cols-2 gap-3">
          <UnitCountStepper
            label={labels.splitAcCount.label}
            icon={<AirVent className="size-4 text-brand" aria-hidden />}
            value={value.splitAcCount}
            onChange={(splitAcCount) =>
              updateField("splitAcCount", splitAcCount)
            }
          />
          <UnitCountStepper
            label={labels.windowAcCount.label}
            icon={<Fan className="size-4 text-[#7c6cf0]" aria-hidden />}
            value={value.windowAcCount}
            onChange={(windowAcCount) =>
              updateField("windowAcCount", windowAcCount)
            }
          />
        </div>

        {showHousingOnlyFields ? (
          <>
            <UnitOptionalCheckboxField
              label={labels.kitchenCabinetsInstalled.label}
              checked={value.kitchenCabinetsInstalled}
              disabled={!kitchensSelected}
              warning={
                kitchensSelected
                  ? undefined
                  : labels.kitchenCabinetsInstalled.kitchensRequiredHint
              }
              onCheckedChange={(kitchenCabinetsInstalled) =>
                updateField("kitchenCabinetsInstalled", kitchenCabinetsInstalled)
              }
            />

            <UnitOptionalCheckboxField
              label={labels.furnished.label}
              checked={value.furnished}
              onCheckedChange={(furnished) =>
                onChange({
                  ...value,
                  furnished,
                  furnishingType: furnished ? value.furnishingType : "",
                })
              }
            >
              <FurnishingTypeToggle
                label={labels.furnishingType.label}
                newLabel={labels.furnishingType.new}
                usedLabel={labels.furnishingType.used}
                value={value.furnishingType}
                onChange={(furnishingType) =>
                  updateField("furnishingType", furnishingType)
                }
              />
            </UnitOptionalCheckboxField>
          </>
        ) : null}

        <UnitOptionalCheckboxField
          label={labels.addElectricityMeter.label}
          checked={value.addElectricityMeter}
          icon={<Zap className="size-4 text-[#e39b2d]" aria-hidden />}
          onCheckedChange={(addElectricityMeter) =>
            onChange({
              ...value,
              addElectricityMeter,
              electricityMeterNumber: addElectricityMeter
                ? value.electricityMeterNumber
                : "",
              electricityMeterRegistration: addElectricityMeter
                ? value.electricityMeterRegistration
                : "",
              electricitySharedMonthlyFee: addElectricityMeter
                ? value.electricitySharedMonthlyFee
                : "",
            })
          }
        >
          <div className="space-y-3">
            <CreateUnitIconInputField
              label={labels.electricityMeterNumber.label}
              placeholder={
                labels.additionalInfo.writeHerePlaceholder ||
                labels.electricityMeterNumber.placeholder
              }
              value={value.electricityMeterNumber}
              onChange={(electricityMeterNumber) =>
                updateField("electricityMeterNumber", electricityMeterNumber)
              }
              icon={Hash}
              dir="ltr"
              inputMode="numeric"
              required={requireMeterRegistration}
              hideLabel={!requireMeterRegistration}
              errorMessage={
                electricityMeterNumberInvalid
                  ? labels.meterNumberRequired ?? labels.fieldRequired
                  : undefined
              }
            />

            {labels.meterRegistration ? (
              <MeterRegistrationOptions
                labels={labels.meterRegistration}
                fee={electricityMeterFee}
                value={value.electricityMeterRegistration}
                onChange={(electricityMeterRegistration) =>
                  onChange({
                    ...value,
                    electricityMeterRegistration,
                    electricitySharedMonthlyFee:
                      electricityMeterRegistration === "shared"
                        ? value.electricitySharedMonthlyFee
                        : "",
                  })
                }
                sharedMonthlyFee={value.electricitySharedMonthlyFee}
                onSharedMonthlyFeeChange={(electricitySharedMonthlyFee) =>
                  updateField(
                    "electricitySharedMonthlyFee",
                    electricitySharedMonthlyFee,
                  )
                }
                contractMonths={contractMonths}
                errorMessage={
                  electricityMeterRegistrationInvalid
                    ? labels.fieldRequired
                    : undefined
                }
                sharedFeeErrorMessage={
                  electricitySharedFeeInvalid ? labels.fieldRequired : undefined
                }
              />
            ) : null}
          </div>
        </UnitOptionalCheckboxField>

        <UnitOptionalCheckboxField
          label={labels.addWaterMeter.label}
          checked={value.addWaterMeter}
          icon={<Droplets className="size-4 text-[#3b82f6]" aria-hidden />}
          onCheckedChange={(addWaterMeter) =>
            onChange({
              ...value,
              addWaterMeter,
              waterMeterNumber: addWaterMeter ? value.waterMeterNumber : "",
              waterMeterRegistration: addWaterMeter
                ? value.waterMeterRegistration
                : "",
              waterSharedMonthlyFee: addWaterMeter
                ? value.waterSharedMonthlyFee
                : "",
            })
          }
        >
          <div className="space-y-3">
            <CreateUnitIconInputField
              label={labels.waterMeterNumber.label}
              placeholder={
                labels.additionalInfo.writeHerePlaceholder ||
                labels.waterMeterNumber.placeholder
              }
              value={value.waterMeterNumber}
              onChange={(waterMeterNumber) =>
                updateField("waterMeterNumber", waterMeterNumber)
              }
              icon={Hash}
              dir="ltr"
              inputMode="numeric"
              required={requireMeterRegistration}
              hideLabel={!requireMeterRegistration}
              errorMessage={
                waterMeterNumberInvalid
                  ? labels.meterNumberRequired ?? labels.fieldRequired
                  : undefined
              }
            />

            {labels.meterRegistration ? (
              <MeterRegistrationOptions
                labels={labels.meterRegistration}
                fee={waterMeterFee}
                value={value.waterMeterRegistration}
                onChange={(waterMeterRegistration) =>
                  onChange({
                    ...value,
                    waterMeterRegistration,
                    waterSharedMonthlyFee:
                      waterMeterRegistration === "shared"
                        ? value.waterSharedMonthlyFee
                        : "",
                  })
                }
                sharedMonthlyFee={value.waterSharedMonthlyFee}
                onSharedMonthlyFeeChange={(waterSharedMonthlyFee) =>
                  updateField("waterSharedMonthlyFee", waterSharedMonthlyFee)
                }
                contractMonths={contractMonths}
                errorMessage={
                  waterMeterRegistrationInvalid ? labels.fieldRequired : undefined
                }
                sharedFeeErrorMessage={
                  waterSharedFeeInvalid ? labels.fieldRequired : undefined
                }
              />
            ) : null}
          </div>
        </UnitOptionalCheckboxField>
      </UnitAdditionalInfoSection>
    </div>
  );
}
