"use client";

import UnitDataFormFields from "@/features/shared/components/unit-data-form-fields";
import UnitsDataFormList from "@/features/shared/components/unit-form/units-data-form-list";
import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import type { RentedUnitDataState } from "@/features/create-contract/types/rented-unit-step";
import {
  useUnitTypeOptions,
  useUnitUsageOptions,
} from "@/features/create-unit/hooks/use-unit-lookup-options";
import { useContractPricing } from "@/features/pricing/hooks/use-contract-pricing";
import { getMeterTransferFee } from "@/features/pricing/types/contract-pricing";
import { buildRentedUnitTypeOptions } from "@/features/create-contract/utils/build-rented-unit-type-options";
import { resolveFinanceDurationMonths } from "@/features/create-contract/utils/resolve-finance-duration-months";
import { useContractPeriods } from "@/features/create-contract/hooks/use-contract-periods";
import { buildUnitFormSummary } from "@/features/shared/utils/build-unit-form-summary";

type CreateContractRentedUnitDataPhaseProps = {
  labels: CreateContractLabels["tenant"]["rentedUnit"];
  units: RentedUnitDataState[];
  onChange: (units: RentedUnitDataState[]) => void;
  showFieldErrors?: boolean;
};

export default function CreateContractRentedUnitDataPhase({
  labels,
  units,
  onChange,
  showFieldErrors = false,
}: CreateContractRentedUnitDataPhaseProps) {
  // #24: resolve the contract type from every reliable source so a missing
  // session never defaults commercial contracts to housing usages (e.g. the
  // "السكن الجماعي"/group-housing usage showing on a commercial unit).
  const contractType = useCreateContractDraftStore((state) => {
    const step1ContractType = state.contractStep1Data?.contract_type;
    return (
      state.contractSession?.contractType ??
      (step1ContractType === "commercial" ? "commercial" : undefined) ??
      (step1ContractType === "housing" ? "housing" : undefined) ??
      "housing"
    );
  });
  const housingUnitTypesQuery = useUnitTypeOptions("housing");
  const commercialUnitTypesQuery = useUnitTypeOptions("commercial");
  const unitUsageQuery = useUnitUsageOptions(contractType);
  // Meter transfer fees come from the public price sheet (`GET /pricing`).
  const { pricing } = useContractPricing();
  // Contract length (when the finance step was already filled) feeds the
  // «× مدة العقد» helper of a shared meter.
  const financeData = useCreateContractDraftStore((state) => state.financeData);
  const contractPeriodsQuery = useContractPeriods(contractType);
  const contractMonths = resolveFinanceDurationMonths(
    financeData,
    contractPeriodsQuery.data ?? [],
  );

  const isLoadingOptions =
    housingUnitTypesQuery.isLoading ||
    commercialUnitTypesQuery.isLoading ||
    unitUsageQuery.isLoading;
  const optionsError =
    housingUnitTypesQuery.error ??
    commercialUnitTypesQuery.error ??
    unitUsageQuery.error;

  if (optionsError) {
    return (
      <p className="text-sm text-red-500">
        {optionsError instanceof Error ? optionsError.message : labels.optionsError}
      </p>
    );
  }

  if (isLoadingOptions) {
    return (
      <div className="space-y-3 py-4">
        <div className="h-10 animate-pulse rounded-full bg-brand-background" />
        <div className="h-10 animate-pulse rounded-full bg-brand-background" />
      </div>
    );
  }

  const electricityMeterFee = getMeterTransferFee(
    pricing,
    contractType,
    "electricity",
  );
  const waterMeterFee = getMeterTransferFee(pricing, contractType, "water");
  const housingUnitTypes = housingUnitTypesQuery.data ?? [];
  const commercialUnitTypes = commercialUnitTypesQuery.data ?? [];
  // Combined list so an already-selected unit type name still resolves in the
  // unit summary regardless of which contract type it belongs to.
  const unitTypeOptions = [...housingUnitTypes, ...commercialUnitTypes];
  const unitTypeSelectOptions = buildRentedUnitTypeOptions({
    housingUnitTypes,
    commercialUnitTypes,
    contractType,
    otherContractTypeNotice: labels.unitType.disabledGroupNotice[contractType],
  });

  return (
    <UnitsDataFormList
      addUnitLabel={labels.addUnit}
      removeUnitLabel={labels.removeUnit}
      unitsCountLabel={labels.unitsCount}
      unitSectionTitle={(index) => `${labels.unitListTitle} ${index + 1}`}
      getUnitSummary={(unit) =>
        buildUnitFormSummary(unit, {
          unitTypeOptions,
          groundFloorLabel: labels.floorOptions.ground,
          floorPrefix: labels.floorSummaryPrefix,
        })
      }
      units={units}
      onUnitsChange={onChange}
      allowAddUnit
      allowRemoveUnit
      renderUnitForm={(unit, _index, onUnitChange) => (
        <UnitDataFormFields
          labels={{
            ...labels,
            unitCardTitle: undefined,
          }}
          unitTypeOptions={unitTypeOptions}
          unitTypeSelectOptions={unitTypeSelectOptions}
          unitUsageOptions={unitUsageQuery.data ?? []}
          value={unit}
          onChange={onUnitChange}
          contractType={contractType}
          electricityMeterFee={electricityMeterFee}
          waterMeterFee={waterMeterFee}
          contractMonths={contractMonths}
          showFieldErrors={showFieldErrors}
          requireMeterRegistration
        />
      )}
    />
  );
}
