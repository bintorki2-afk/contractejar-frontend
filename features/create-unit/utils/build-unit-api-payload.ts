import type { PropertyContractType } from "@/features/create-property/utils/contract-type";
import type { UnitDataState } from "@/features/create-unit/types/unit-data";
import { digitsOnly, toAsciiDigits } from "@/lib/utils/digits";

function parseCount(value: string) {
  const parsed = Number(digitsOnly(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseFloorNumber(value: string) {
  if (value === "ground") {
    return 0;
  }

  return parseCount(value);
}

function parseArea(value: string) {
  const parsed = Number(toAsciiDigits(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

export function buildUnitFieldsPayload(unitData: UnitDataState) {
  const payload: Record<string, string | number | boolean | []> = {
    unit_type_id: Number(unitData.unitTypeId),
    unit_usage_id: Number(unitData.unitUsageId),
    unit_number: unitData.unitNumber.trim(),
    floor_number: parseFloorNumber(unitData.floorNumber),
    unit_area: parseArea(unitData.totalArea),
    Services: [],
  };

  if (unitData.unitId) {
    payload.unit_id = unitData.unitId;
  }

  if (unitData.contractType === "housing" || unitData.contractType === "commercial") {
    payload.contract_type = unitData.contractType;
  }

  if (unitData.roomsCount !== "") {
    const roomsCount = parseCount(unitData.roomsCount);
    payload.tootal_rooms = roomsCount;
    payload.number_of_rooms = roomsCount;
  }

  if (unitData.hallsCount !== "") {
    payload.The_number_of_halls = parseCount(unitData.hallsCount);
  }

  if (unitData.kitchensCount !== "") {
    payload.The_number_of_kitchens = parseCount(unitData.kitchensCount);
  }

  if (unitData.bathroomsCount !== "") {
    const bathroomsCount = parseCount(unitData.bathroomsCount);
    payload.The_number_of_toilets = bathroomsCount;
    payload.The_number_of_the_toilet = bathroomsCount;
  }

  if (unitData.windowAcCount !== "") {
    payload.window_ac = parseCount(unitData.windowAcCount);
  }

  if (unitData.splitAcCount !== "") {
    payload.split_ac = parseCount(unitData.splitAcCount);
  }

  if (unitData.kitchenCabinetsInstalled) {
    payload.kitchen_tank = true;
  }

  if (unitData.furnished && unitData.furnishingType !== "") {
    payload.furnished = true;
    payload.type_furnished = unitData.furnishingType === "new";
  }

  const electricityMeterNumber = unitData.electricityMeterNumber.trim();
  if (unitData.addElectricityMeter && electricityMeterNumber !== "") {
    payload.electricity_meter = true;
    payload.electricity_meter_number = electricityMeterNumber;
  }

  if (
    unitData.addElectricityMeter &&
    unitData.electricityMeterRegistration !== ""
  ) {
    payload.electricity_meter_ownership =
      unitData.electricityMeterRegistration;

    if (unitData.electricityMeterRegistration === "shared") {
      payload.electricity_shared_monthly_fee = parseArea(
        unitData.electricitySharedMonthlyFee,
      );
    }
  }

  const waterMeterNumber = unitData.waterMeterNumber.trim();
  if (unitData.addWaterMeter && waterMeterNumber !== "") {
    payload.water_meter = true;
    payload.water_meter_number = waterMeterNumber;
  }

  if (unitData.addWaterMeter && unitData.waterMeterRegistration !== "") {
    payload.water_meter_ownership = unitData.waterMeterRegistration;

    if (unitData.waterMeterRegistration === "shared") {
      payload.water_shared_monthly_fee = parseArea(
        unitData.waterSharedMonthlyFee,
      );
    }
  }

  return payload;
}

export function buildUnitsCreateApiPayload(
  propertyId: number,
  contractType: PropertyContractType,
  units: UnitDataState[],
) {
  return {
    real_estates_units_id: propertyId,
    contract_type: contractType,
    units: units.map((unit) => buildUnitFieldsPayload(unit)),
  };
}

export function buildRealEstateStep3Payload(
  propertyId: number,
  units: UnitDataState[],
  defaultContractType?: PropertyContractType,
) {
  return {
    id: propertyId,
    units: units.map((unit) => {
      const payload = buildUnitFieldsPayload(unit);

      if (
        !("contract_type" in payload) &&
        (defaultContractType === "housing" ||
          defaultContractType === "commercial")
      ) {
        payload.contract_type = defaultContractType;
      }

      return payload;
    }),
  };
}

export function buildUnitApiPayload(
  propertyId: number,
  contractType: PropertyContractType,
  unitData: UnitDataState,
) {
  return {
    real_estates_units_id: propertyId,
    contract_type: contractType,
    ...buildUnitFieldsPayload(unitData),
  };
}
