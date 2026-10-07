import {
  getAgentDataValidationIssues,
  getOwnerDataValidationIssues,
  isOwnerDataComplete,
  isPhoneComplete,
  type OwnerValidationIssue,
} from "@/lib/validation/owner-step-validation";
import { isAdultBirthDateComplete } from "@/lib/validation/birth-date-year-options";

export const PROPERTY_HAS_AGENT_OPTIONS = ["yes", "no"] as const;

export type PropertyHasAgentOption =
  (typeof PROPERTY_HAS_AGENT_OPTIONS)[number];

export type PropertyCalendarType = "hijri" | "gregorian";

export type PropertyBirthDateValue = {
  calendarType: PropertyCalendarType;
  day: string;
  month: string;
  year: string;
};

export const EMPTY_PROPERTY_BIRTH_DATE: PropertyBirthDateValue = {
  calendarType: "hijri",
  day: "",
  month: "",
  year: "",
};

export type PropertyOwnerDataState = {
  fullName: string;
  idNumber: string;
  birthDate: PropertyBirthDateValue;
  phone: string;
  iban: string;
  hasAgent: PropertyHasAgentOption | "";
};

export type PropertyAgentDataState = {
  idNumber: string;
  birthDate: PropertyBirthDateValue;
  phone: string;
  powerOfAttorneyFiles: File[];
};

export const EMPTY_PROPERTY_OWNER_DATA: PropertyOwnerDataState = {
  fullName: "",
  idNumber: "",
  birthDate: EMPTY_PROPERTY_BIRTH_DATE,
  phone: "",
  iban: "",
  hasAgent: "no",
};

export const EMPTY_PROPERTY_AGENT_DATA: PropertyAgentDataState = {
  idNumber: "",
  birthDate: { ...EMPTY_PROPERTY_BIRTH_DATE },
  phone: "",
  powerOfAttorneyFiles: [],
};

export const PROPERTY_OWNER_STEP_MAX_PHASE_COUNT = 2;

export type PropertyOwnerValidationIssue = OwnerValidationIssue;

export function isPropertyOwnerDataComplete(ownerData: PropertyOwnerDataState) {
  // The triple owner name field was removed from the form; it stays in the model
  // with a default empty value and no longer gates step completion.
  return isOwnerDataComplete(ownerData);
}

export function isPropertyAgentDataComplete(
  agentData: PropertyAgentDataState,
  options?: { allowExistingPowerOfAttorney?: boolean },
) {
  const hasPowerOfAttorney =
    agentData.powerOfAttorneyFiles.length === 1 ||
    Boolean(options?.allowExistingPowerOfAttorney);

  return (
    agentData.idNumber.replace(/[٠-٩۰-۹]/g, (d) => "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹".indexOf(d) % 10 + "").replace(/\D/g, "").length === 10 &&
    isAdultBirthDateComplete(agentData.birthDate) &&
    isPhoneComplete(agentData.phone) &&
    hasPowerOfAttorney
  );
}

export function getPropertyOwnerValidationIssues(
  ownerData: PropertyOwnerDataState,
): PropertyOwnerValidationIssue[] {
  return getOwnerDataValidationIssues(ownerData);
}

export function getPropertyAgentValidationIssues(
  agentData: PropertyAgentDataState,
): PropertyOwnerValidationIssue[] {
  const issues = getAgentDataValidationIssues(
    agentData,
  ) as PropertyOwnerValidationIssue[];

  if (
    agentData.powerOfAttorneyFiles.length > 0 &&
    agentData.powerOfAttorneyFiles.length !== 1
  ) {
    issues.push("powerOfAttorney");
  }

  return issues;
}

export function getPropertyOwnerStepPhaseCount(
  hasAgent: PropertyHasAgentOption | "",
) {
  return hasAgent === "yes" ? PROPERTY_OWNER_STEP_MAX_PHASE_COUNT : 1;
}

export type { OwnerValidationIssue };
