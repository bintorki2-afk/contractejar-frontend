import type { CompletedContractDetails } from "@/features/requests/services/get-completed-contract-details";
import type { CompletedContractUnit } from "@/features/requests/types/completed-contract";
import { formatFloorDisplay } from "@/features/shared/utils/format-floor-display";
import { formatSaudiMobileForForm } from "@/lib/validation/format-saudi-mobile-for-form";

/** #25: normalize any stored/API phone (00966…, 966…, +966…) to 05XXXXXXXX. */
function toPhoneDisplayValue(
  value: string | number | null | undefined,
  emptyValue = "—",
) {
  if (value === null || value === undefined) {
    return null;
  }

  const formatted = formatSaudiMobileForForm(String(value));
  return formatted || emptyValue;
}

export type RequestContractDetailsRow = {
  label: string;
  value: string;
  href?: string;
};

export type RequestContractDetailsSection = {
  title: string;
  rows: RequestContractDetailsRow[];
};

export type RequestContractDetailsViewModel = {
  requestNumber: string;
  sections: RequestContractDetailsSection[];
};

export type RequestContractDialogLabels = {
  title: string;
  subtitle: string;
  close: string;
  loading: string;
  emptyValue: string;
  groundFloor: string;
  linkPreview: string;
  overviewSection: string;
  ownerSection: string;
  tenantSection: string;
  unitSection: string;
  financeSection: string;
  servicesSection: string;
  instrumentTypes: Record<string, string>;
  fields: {
    requestNumber: string;
    contractType: string;
    status: string;
    instrumentType: string;
    propertyName: string;
    createdAt: string;
    addressUrl: string;
    name: string;
    idNumber: string;
    mobile: string;
    unitNumber: string;
    unitType: string;
    usage: string;
    area: string;
    floor: string;
    rooms: string;
    halls: string;
    kitchens: string;
    toilets: string;
    electricityMeter: string;
    waterMeter: string;
    furnished: string;
    kitchenTank: string;
    parking: string;
    gasMeter: string;
    contractDuration: string;
    annualRent: string;
    paymentType: string;
    contractPeriodPrice: string;
    applicationFees: string;
    tax: string;
    electricityMeterFee: string;
    waterMeterFee: string;
    servicesTotal: string;
    meterFeesTotal: string;
    docFee: string;
    totalPrice: string;
    yes: string;
    no: string;
    housing: string;
    commercial: string;
  };
  duration: {
    oneYear: string;
    years: string;
    months: string;
  };
  currency: string;
  areaUnit: string;
};

function toDisplayValue(
  value: string | number | boolean | null | undefined,
  emptyValue = "—",
) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  const text = String(value).trim();
  if (
    text === "" ||
    text === emptyValue ||
    text === "-" ||
    text === "–" ||
    text === "—" ||
    text === "null" ||
    text === "undefined"
  ) {
    return null;
  }

  return text;
}

function pushRow(
  rows: RequestContractDetailsRow[],
  label: string,
  value: string | null,
  href?: string,
) {
  if (value) {
    rows.push(href ? { label, value, href } : { label, value });
  }
}

function formatAmount(value: number | null | undefined, currency: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return `${value.toLocaleString("en-US")} ${currency}`;
}

function formatBool(
  value: boolean | number | null | undefined,
  labels: RequestContractDialogLabels,
) {
  if (value === null || value === undefined) {
    return null;
  }

  return value === true || value === 1 ? labels.fields.yes : labels.fields.no;
}

function buildSection(
  title: string,
  rows: RequestContractDetailsRow[],
): RequestContractDetailsSection | null {
  if (rows.length === 0) {
    return null;
  }

  return { title, rows };
}

function formatDuration(
  contract: CompletedContractDetails["contract"],
  labels: RequestContractDialogLabels,
) {
  const years = contract.duration_years;
  const months = contract.duration_months;

  if (contract.duration_preset === "other") {
    const parts: string[] = [];

    if (typeof years === "number" && years > 0) {
      parts.push(
        years === 1
          ? labels.duration.oneYear
          : labels.duration.years.replace("{count}", String(years)),
      );
    }

    if (typeof months === "number" && months > 0) {
      parts.push(labels.duration.months.replace("{count}", String(months)));
    }

    return parts.length > 0 ? parts.join(" · ") : null;
  }

  if (typeof years === "number" && years > 0) {
    return years === 1
      ? labels.duration.oneYear
      : labels.duration.years.replace("{count}", String(years));
  }

  if (typeof contract.total_months === "number" && contract.total_months > 0) {
    return labels.duration.months.replace(
      "{count}",
      String(contract.total_months),
    );
  }

  return null;
}

function resolveUnits(contract: CompletedContractDetails["contract"]) {
  if (Array.isArray(contract.units) && contract.units.length > 0) {
    return contract.units;
  }

  return [];
}

function formatInstrumentType(
  instrumentType: string | null | undefined,
  instrumentTypeTrans: string | null | undefined,
  labels: RequestContractDialogLabels,
) {
  const translated = toDisplayValue(instrumentTypeTrans, labels.emptyValue);
  if (translated) {
    return translated;
  }

  const raw = toDisplayValue(instrumentType, labels.emptyValue);
  if (!raw) {
    return null;
  }

  return labels.instrumentTypes[raw] ?? raw;
}

function formatContractType(
  contractType: string | null | undefined,
  labels: RequestContractDialogLabels,
) {
  if (!contractType) {
    return null;
  }

  if (contractType === "housing" || contractType === "residential") {
    return labels.fields.housing;
  }

  if (contractType === "commercial") {
    return labels.fields.commercial;
  }

  return contractType;
}

function buildUnitRows(
  unit: CompletedContractUnit,
  labels: RequestContractDialogLabels,
  empty: string,
) {
  const unitRows: RequestContractDetailsRow[] = [];

  pushRow(
    unitRows,
    labels.fields.unitNumber,
    toDisplayValue(unit.unit_number, empty),
  );
  pushRow(
    unitRows,
    labels.fields.unitType,
    toDisplayValue(unit.unit_type_name, empty),
  );
  pushRow(
    unitRows,
    labels.fields.usage,
    toDisplayValue(unit.unit_usage_name, empty),
  );
  const area = toDisplayValue(unit.unit_area, empty);
  pushRow(
    unitRows,
    labels.fields.area,
    area ? `${area} ${labels.areaUnit}` : null,
  );
  pushRow(
    unitRows,
    labels.fields.floor,
    formatFloorDisplay(unit.floor_number, labels.groundFloor),
  );
  pushRow(
    unitRows,
    labels.fields.rooms,
    toDisplayValue(unit.tootal_rooms ?? unit.number_of_rooms, empty),
  );
  pushRow(
    unitRows,
    labels.fields.halls,
    toDisplayValue(unit.The_number_of_halls, empty),
  );
  pushRow(
    unitRows,
    labels.fields.kitchens,
    toDisplayValue(unit.The_number_of_kitchens, empty),
  );
  pushRow(
    unitRows,
    labels.fields.toilets,
    toDisplayValue(
      unit.The_number_of_toilets ?? unit.The_number_of_the_toilet,
      empty,
    ),
  );
  pushRow(
    unitRows,
    labels.fields.electricityMeter,
    toDisplayValue(unit.electricity_meter_number, empty) ??
      formatBool(unit.electricity_meter, labels),
  );
  pushRow(
    unitRows,
    labels.fields.waterMeter,
    toDisplayValue(unit.water_meter_number, empty) ??
      formatBool(unit.water_meter, labels),
  );
  pushRow(
    unitRows,
    labels.fields.furnished,
    formatBool(unit.furnished, labels),
  );
  pushRow(
    unitRows,
    labels.fields.kitchenTank,
    formatBool(unit.kitchen_tank, labels),
  );
  pushRow(
    unitRows,
    labels.fields.parking,
    toDisplayValue(unit.Number_parking_spaces, empty),
  );
  pushRow(
    unitRows,
    labels.fields.gasMeter,
    toDisplayValue(unit.Gasmeter, empty),
  );

  return unitRows;
}

export function mapCompletedContractToDetails(
  data: CompletedContractDetails,
  labels: RequestContractDialogLabels,
): RequestContractDetailsViewModel {
  const empty = labels.emptyValue;
  const { contract, financial } = data;
  const units = resolveUnits(contract);

  const overviewRows: RequestContractDetailsRow[] = [];
  pushRow(
    overviewRows,
    labels.fields.requestNumber,
    toDisplayValue(contract.uuid, empty),
  );
  pushRow(
    overviewRows,
    labels.fields.contractType,
    toDisplayValue(contract.contract_type_trans, empty) ??
      formatContractType(contract.contract_type, labels),
  );
  pushRow(
    overviewRows,
    labels.fields.status,
    toDisplayValue(contract.status_label, empty),
  );
  pushRow(
    overviewRows,
    labels.fields.instrumentType,
    formatInstrumentType(
      contract.instrument_type,
      contract.instrument_type_trans,
      labels,
    ),
  );
  pushRow(
    overviewRows,
    labels.fields.propertyName,
    toDisplayValue(contract.name_real_estate, empty),
  );
  pushRow(
    overviewRows,
    labels.fields.createdAt,
    toDisplayValue(contract.created_at, empty),
  );
  const addressUrl = toDisplayValue(contract.address_url, empty);
  pushRow(
    overviewRows,
    labels.fields.addressUrl,
    addressUrl ? labels.linkPreview : null,
    addressUrl ?? undefined,
  );

  const ownerRows: RequestContractDetailsRow[] = [];
  pushRow(
    ownerRows,
    labels.fields.name,
    toDisplayValue(contract.name_owner, empty),
  );
  pushRow(
    ownerRows,
    labels.fields.idNumber,
    toDisplayValue(contract.property_owner_id_num, empty),
  );
  pushRow(
    ownerRows,
    labels.fields.mobile,
    toPhoneDisplayValue(contract.property_owner_mobile, empty),
  );

  const tenantRows: RequestContractDetailsRow[] = [];
  pushRow(
    tenantRows,
    labels.fields.name,
    toDisplayValue(contract.tenant_name, empty),
  );
  pushRow(
    tenantRows,
    labels.fields.idNumber,
    toDisplayValue(contract.tenant_id_num, empty),
  );
  pushRow(
    tenantRows,
    labels.fields.mobile,
    toPhoneDisplayValue(contract.tenant_mobile, empty),
  );

  const unitSections = units.map((unit, index) =>
    buildSection(
      units.length > 1
        ? `${labels.unitSection} (${index + 1})`
        : labels.unitSection,
      buildUnitRows(unit, labels, empty),
    ),
  );

  const financeRows: RequestContractDetailsRow[] = [];
  pushRow(
    financeRows,
    labels.fields.contractDuration,
    formatDuration(contract, labels),
  );
  pushRow(
    financeRows,
    labels.fields.annualRent,
    formatAmount(contract.annual_rent_amount_for_the_unit, labels.currency),
  );
  pushRow(
    financeRows,
    labels.fields.paymentType,
    toDisplayValue(contract.payment_type_name, empty),
  );
  pushRow(
    financeRows,
    labels.fields.contractPeriodPrice,
    formatAmount(financial?.price_details?.contract_period_price, labels.currency),
  );
  pushRow(
    financeRows,
    labels.fields.applicationFees,
    formatAmount(financial?.price_details?.application_fees, labels.currency),
  );
  pushRow(
    financeRows,
    labels.fields.tax,
    formatAmount(financial?.price_details?.tax, labels.currency),
  );
  pushRow(
    financeRows,
    labels.fields.electricityMeterFee,
    formatAmount(financial?.price_details?.electricity_meter_fee, labels.currency),
  );
  pushRow(
    financeRows,
    labels.fields.waterMeterFee,
    formatAmount(financial?.price_details?.water_meter_fee, labels.currency),
  );
  pushRow(
    financeRows,
    labels.fields.meterFeesTotal,
    formatAmount(financial?.meter_fees_total, labels.currency),
  );
  pushRow(
    financeRows,
    labels.fields.docFee,
    formatAmount(financial?.doc_fee, labels.currency),
  );
  pushRow(
    financeRows,
    labels.fields.totalPrice,
    formatAmount(financial?.total_price, labels.currency),
  );

  // Legacy «services» rows (`services_pricings`) are not part of the order's
  // price and showed e.g. «إجمالي الخدمات 325» on a 249 order (CROSS-W3): the
  // charged lines live only in the invoice (`GET /invoices/{id}` items[]).

  const sections = [
    buildSection(labels.overviewSection, overviewRows),
    buildSection(labels.ownerSection, ownerRows),
    buildSection(labels.tenantSection, tenantRows),
    ...unitSections,
    buildSection(labels.financeSection, financeRows),
  ].filter(
    (section): section is RequestContractDetailsSection => section !== null,
  );

  return {
    requestNumber: String(contract.uuid),
    sections,
  };
}
