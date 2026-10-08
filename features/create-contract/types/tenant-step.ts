import { isValidPersonId } from "@/lib/validation/national-id";
import {
  EMPTY_BIRTH_DATE,
  type BirthDateValue,
} from "@/features/create-contract/types/owner-step";
import { isAdultBirthDateComplete } from "@/lib/validation/birth-date-year-options";
import { isPhoneComplete } from "@/lib/validation/owner-step-validation";
import {
  isUnifiedRecordNumberPrefixOnly,
  UNIFIED_RECORD_NUMBER_LENGTH,
} from "@/lib/validation/format-unified-record-number-for-form";

export const TENANT_STATUS_OPTIONS = [
  "individual",
  "establishment-or-company",
] as const;

export type TenantStatusOption = (typeof TENANT_STATUS_OPTIONS)[number];

export const DELEGATION_TYPE_OPTIONS = [
  "owner-representative",
  "agent-authorized",
] as const;

export type DelegationTypeOption = (typeof DELEGATION_TYPE_OPTIONS)[number];

export type IndividualTenantData = {
  idNumber: string;
  birthDate: BirthDateValue;
  phone: string;
};

export const EMPTY_INDIVIDUAL_TENANT_DATA: IndividualTenantData = {
  idNumber: "",
  birthDate: EMPTY_BIRTH_DATE,
  phone: "",
};

export type OrganizationTenantData = {
  delegationType: DelegationTypeOption | "";
  unifiedRecordNumber: string;
  ownerIdNumber: string;
  ownerBirthDate: BirthDateValue;
  ownerPhone: string;
  powerOfAttorneyFiles: File[];
};

export const EMPTY_ORGANIZATION_TENANT_DATA: OrganizationTenantData = {
  delegationType: "owner-representative",
  unifiedRecordNumber: "7",
  ownerIdNumber: "",
  ownerBirthDate: EMPTY_BIRTH_DATE,
  ownerPhone: "",
  powerOfAttorneyFiles: [],
};

export type TenantDataState = {
  status: TenantStatusOption | "";
  individual: IndividualTenantData;
  organization: OrganizationTenantData;
};

export const EMPTY_TENANT_DATA: TenantDataState = {
  status: "individual",
  individual: EMPTY_INDIVIDUAL_TENANT_DATA,
  organization: EMPTY_ORGANIZATION_TENANT_DATA,
};

export function isOrganizationTenantStatus(status: TenantStatusOption | "") {
  return status === "establishment-or-company";
}

function isBirthDateComplete(birthDate: BirthDateValue) {
  return isAdultBirthDateComplete(birthDate);
}

function isIdNumberComplete(idNumber: string) {
  return isValidPersonId(idNumber);
}

function isUnifiedRecordNumberComplete(unifiedRecordNumber: string) {
  if (isUnifiedRecordNumberPrefixOnly(unifiedRecordNumber)) {
    return false;
  }

  const digits = unifiedRecordNumber.replace(/[٠-٩۰-۹]/g, (d) => "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹".indexOf(d) % 10 + "").replace(/\D/g, "");
  return (
    digits.length === UNIFIED_RECORD_NUMBER_LENGTH &&
    digits.startsWith("7")
  );
}

function isIndividualTenantComplete(individual: IndividualTenantData) {
  return (
    isIdNumberComplete(individual.idNumber) &&
    isBirthDateComplete(individual.birthDate) &&
    isPhoneComplete(individual.phone)
  );
}

function isOrganizationTenantComplete(organization: OrganizationTenantData) {
  const baseComplete =
    organization.delegationType !== "" &&
    isUnifiedRecordNumberComplete(organization.unifiedRecordNumber) &&
    isIdNumberComplete(organization.ownerIdNumber) &&
    isBirthDateComplete(organization.ownerBirthDate) &&
    isPhoneComplete(organization.ownerPhone);

  if (!baseComplete) {
    return false;
  }

  if (organization.delegationType === "agent-authorized") {
    return organization.powerOfAttorneyFiles.length > 0;
  }

  return true;
}

export function isTenantDataComplete(tenantData: TenantDataState) {
  if (tenantData.status === "") {
    return false;
  }

  if (tenantData.status === "individual") {
    return isIndividualTenantComplete(tenantData.individual);
  }

  if (isOrganizationTenantStatus(tenantData.status)) {
    return isOrganizationTenantComplete(tenantData.organization);
  }

  return false;
}

export function isLeaseRenewalAmendmentsComplete({
  addNotes,
  notes,
}: {
  addNotes: boolean;
  notes: string;
}) {
  if (addNotes && notes.trim().length === 0) {
    return false;
  }

  return true;
}

export function isLeaseRenewalTenantDataComplete({
  tenantData,
  addNotes,
  notes,
}: {
  tenantData: TenantDataState;
  addNotes: boolean;
  notes: string;
}) {
  return (
    isTenantDataComplete(tenantData) &&
    isLeaseRenewalAmendmentsComplete({ addNotes, notes })
  );
}
