import type { PropertyContractType } from "@/features/create-property/utils/contract-type";

export const FURNISHING_TYPE_OPTIONS = ["new", "used"] as const;

export type FurnishingTypeOption = (typeof FURNISHING_TYPE_OPTIONS)[number];

export const METER_REGISTRATION_PARTIES = ["owner", "tenant", "shared"] as const;

export type MeterRegistrationParty =
  (typeof METER_REGISTRATION_PARTIES)[number];

export type UnitDataState = {
  unitId?: number;
  contractType?: PropertyContractType;
  unitTypeId: string;
  unitUsageId: string;
  totalArea: string;
  floorNumber: string;
  unitNumber: string;
  roomsCount: string;
  hallsCount: string;
  majlisCount: string;
  kitchensCount: string;
  bathroomsCount: string;
  windowAcCount: string;
  splitAcCount: string;
  kitchenCabinetsInstalled: boolean;
  furnished: boolean;
  furnishingType: FurnishingTypeOption | "";
  addElectricityMeter: boolean;
  electricityMeterNumber: string;
  electricityMeterRegistration: MeterRegistrationParty | "";
  /** «عداد مشترك»: monthly amount the tenant pays (SAR), required when shared. */
  electricitySharedMonthlyFee: string;
  addWaterMeter: boolean;
  waterMeterNumber: string;
  waterMeterRegistration: MeterRegistrationParty | "";
  waterSharedMonthlyFee: string;
};

export const EMPTY_UNIT_DATA: UnitDataState = {
  unitTypeId: "",
  unitUsageId: "",
  totalArea: "",
  floorNumber: "",
  unitNumber: "",
  roomsCount: "",
  hallsCount: "",
  majlisCount: "",
  kitchensCount: "",
  bathroomsCount: "",
  windowAcCount: "",
  splitAcCount: "",
  kitchenCabinetsInstalled: false,
  furnished: false,
  furnishingType: "",
  addElectricityMeter: false,
  electricityMeterNumber: "",
  electricityMeterRegistration: "",
  electricitySharedMonthlyFee: "",
  addWaterMeter: false,
  waterMeterNumber: "",
  waterMeterRegistration: "",
  waterSharedMonthlyFee: "",
};

export function isSelectFilled(value: string) {
  return value !== "";
}

export function isPositiveNumber(value: string) {
  const normalized = value.replace(/,/g, "").trim();
  if (normalized === "") {
    return false;
  }

  const number = Number(normalized);
  return Number.isFinite(number) && number > 0;
}

export function isUnitNumberFilled(value: string) {
  return value.trim() !== "";
}

export function isUnitDataComplete(
  unitData: UnitDataState,
  options?: { requireMeterRegistration?: boolean },
) {
  const baseComplete =
    isSelectFilled(unitData.unitTypeId) &&
    isSelectFilled(unitData.unitUsageId) &&
    isPositiveNumber(unitData.totalArea) &&
    isSelectFilled(unitData.floorNumber) &&
    unitData.unitNumber.trim() !== "";

  if (!baseComplete) {
    return false;
  }

  if (!options?.requireMeterRegistration) {
    return true;
  }

  return (
    isMeterSectionComplete(
      unitData.addElectricityMeter,
      unitData.electricityMeterNumber,
      unitData.electricityMeterRegistration,
      unitData.electricitySharedMonthlyFee,
    ) &&
    isMeterSectionComplete(
      unitData.addWaterMeter,
      unitData.waterMeterNumber,
      unitData.waterMeterRegistration,
      unitData.waterSharedMonthlyFee,
    )
  );
}

/**
 * A toggled-on meter needs its number, who it is registered to, and — for a
 * shared meter — the monthly amount charged to the tenant.
 */
export function isMeterSectionComplete(
  enabled: boolean,
  meterNumber: string,
  registration: MeterRegistrationParty | "",
  sharedMonthlyFee: string,
) {
  if (!enabled) {
    return true;
  }

  if (meterNumber.trim() === "" || registration === "") {
    return false;
  }

  if (registration === "shared" && !isPositiveNumber(sharedMonthlyFee)) {
    return false;
  }

  return true;
}

export function areAllUnitsComplete(
  units: UnitDataState[],
  options?: { requireMeterRegistration?: boolean },
) {
  return units.length > 0 && units.every((unit) => isUnitDataComplete(unit, options));
}

export function buildCountOptions(max = 20) {
  return Array.from({ length: max + 1 }, (_, index) => {
    const value = String(index);
    return { value, label: value };
  });
}
