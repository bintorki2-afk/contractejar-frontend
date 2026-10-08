import type { PropertyContractType } from "@/features/create-property/utils/contract-type";
import type { PropertyUnitApiItem } from "@/features/property-units/types/property-units-api";
import type { UnitDataState } from "@/features/create-unit/types/unit-data";

function displayCount(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const parsed = Number(String(value).replace(/[٠-٩۰-۹]/g, (d) => "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹".indexOf(d) % 10 + "").replace(/\D/g, ""));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return "";
  }

  return String(parsed).padStart(2, "0");
}

function mapFloorNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const text = String(value).trim();
  const numeric = Number(text);
  if (Number.isFinite(numeric) && numeric < 1) {
    return "ground";
  }

  return text;
}

function mapRoomsCount(unit: PropertyUnitApiItem) {
  return displayCount(unit.tootal_rooms ?? unit.number_of_rooms);
}

function mapBathroomsCount(unit: PropertyUnitApiItem) {
  return displayCount(unit.The_number_of_toilets ?? unit.The_number_of_the_toilet);
}

function displayFee(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : "";
}

function mapMeterRegistration(
  value: string | null | undefined,
): UnitDataState["electricityMeterRegistration"] {
  if (value === "owner" || value === "tenant" || value === "shared") {
    return value;
  }

  return "";
}

export function mapApiUnitToUnitData(
  unit: PropertyUnitApiItem,
  contractType?: PropertyContractType,
): UnitDataState {
  const furnished = Boolean(unit.furnished);
  const resolvedContractType =
    unit.contract_type === "commercial" || unit.contract_type === "housing"
      ? unit.contract_type
      : contractType;

  return {
    unitId: unit.id,
    contractType: resolvedContractType,
    unitTypeId: unit.unit_type_id ? String(unit.unit_type_id) : "",
    unitUsageId: unit.unit_usage_id ? String(unit.unit_usage_id) : "",
    totalArea: unit.unit_area?.trim() ?? "",
    floorNumber: mapFloorNumber(unit.floor_number),
    unitNumber: unit.unit_number?.trim() ?? "",
    roomsCount: mapRoomsCount(unit),
    hallsCount: displayCount(unit.The_number_of_halls),
    majlisCount: "",
    kitchensCount: displayCount(unit.The_number_of_kitchens),
    bathroomsCount: mapBathroomsCount(unit),
    windowAcCount: displayCount(unit.window_ac),
    splitAcCount: displayCount(unit.split_ac),
    kitchenCabinetsInstalled: Boolean(unit.kitchen_tank),
    furnished,
    furnishingType: furnished
      ? unit.type_furnished
        ? "new"
        : "used"
      : "",
    addElectricityMeter: Boolean(unit.electricity_meter),
    electricityMeterNumber: unit.electricity_meter_number?.trim() ?? "",
    electricityMeterRegistration: mapMeterRegistration(
      unit.electricity_meter_ownership,
    ),
    electricitySharedMonthlyFee: displayFee(unit.electricity_shared_monthly_fee),
    addWaterMeter: Boolean(unit.water_meter),
    waterMeterNumber: unit.water_meter_number?.trim() ?? "",
    waterMeterRegistration: mapMeterRegistration(unit.water_meter_ownership),
    waterSharedMonthlyFee: displayFee(unit.water_shared_monthly_fee),
  };
}
