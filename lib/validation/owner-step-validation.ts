import { isSaudiMobilePrefixOnly } from "@/lib/validation/format-saudi-mobile-for-form";
import { isAdultBirthDateComplete } from "@/lib/validation/birth-date-year-options";
import { digitsOnly } from "@/lib/utils/digits";
import { isValidOwnerId, isValidPersonId } from "@/lib/validation/national-id";

export type OwnerBirthDateLike = {
  calendarType?: "hijri" | "gregorian";
  day: string;
  month: string;
  year: string;
};

export type OwnerDataLike = {
  fullName: string;
  idNumber: string;
  birthDate: OwnerBirthDateLike;
  phone: string;
  iban?: string;
  hasAgent: string;
};

export type AgentDataLike = {
  idNumber: string;
  birthDate: OwnerBirthDateLike;
  phone: string;
  powerOfAttorneyFiles: File[];
};

export type OwnerValidationIssue =
  | "fullName"
  | "idNumber"
  | "idNumberLength"
  | "birthDate"
  | "phone"
  | "phoneLength"
  | "iban"
  | "ibanInvalid"
  | "hasAgent"
  | "powerOfAttorney";

function isBirthDateComplete(birthDate: OwnerBirthDateLike) {
  if (birthDate.day === "" || birthDate.month === "" || birthDate.year === "") {
    return false;
  }

  return isAdultBirthDateComplete({
    calendarType: birthDate.calendarType ?? "hijri",
    day: birthDate.day,
    month: birthDate.month,
    year: birthDate.year,
  });
}

/** Saudi mobile as entered by the user: 05xxxxxxxx (10 digits). */
export function isPhoneComplete(phone: string) {
  const digits = digitsOnly(phone);
  return /^05\d{8}$/.test(digits);
}

function isIdNumberComplete(idNumber: string, allowEstablishment = false) {
  return allowEstablishment ? isValidOwnerId(idNumber) : isValidPersonId(idNumber);
}

export function isOwnerDataComplete(ownerData: OwnerDataLike) {
  return (
    isIdNumberComplete(ownerData.idNumber, true) &&
    isBirthDateComplete(ownerData.birthDate) &&
    isPhoneComplete(ownerData.phone) &&
    ownerData.hasAgent !== ""
  );
}

export function isAgentDataComplete(agentData: AgentDataLike) {
  return (
    isIdNumberComplete(agentData.idNumber) &&
    isBirthDateComplete(agentData.birthDate) &&
    isPhoneComplete(agentData.phone) &&
    agentData.powerOfAttorneyFiles.length > 0
  );
}

export function getOwnerDataValidationIssues(
  ownerData: OwnerDataLike,
): OwnerValidationIssue[] {
  const issues: OwnerValidationIssue[] = [];

  const idDigits = digitsOnly(ownerData.idNumber);
  if (idDigits.length === 0) {
    issues.push("idNumber");
  } else if (!isValidOwnerId(idDigits)) {
    issues.push("idNumberLength");
  }

  if (!isBirthDateComplete(ownerData.birthDate)) {
    issues.push("birthDate");
  }

  if (isSaudiMobilePrefixOnly(ownerData.phone)) {
    issues.push("phone");
  } else if (!isPhoneComplete(ownerData.phone)) {
    issues.push("phoneLength");
  }

  if (ownerData.hasAgent === "") {
    issues.push("hasAgent");
  }

  return issues;
}

export function getAgentDataValidationIssues(
  agentData: AgentDataLike,
): OwnerValidationIssue[] {
  const issues: OwnerValidationIssue[] = [];

  const idDigits = digitsOnly(agentData.idNumber);
  if (idDigits.length === 0) {
    issues.push("idNumber");
  } else if (!isValidPersonId(idDigits)) {
    issues.push("idNumberLength");
  }

  if (!isBirthDateComplete(agentData.birthDate)) {
    issues.push("birthDate");
  }

  if (isSaudiMobilePrefixOnly(agentData.phone)) {
    issues.push("phone");
  } else if (!isPhoneComplete(agentData.phone)) {
    issues.push("phoneLength");
  }

  if (agentData.powerOfAttorneyFiles.length === 0) {
    issues.push("powerOfAttorney");
  }

  return issues;
}

export function getIdNumberFieldError(
  idNumber: string,
  messages: { required: string; length: string },
  options?: { showEmpty?: boolean; allowEstablishment?: boolean },
) {
  const digits = digitsOnly(idNumber);
  if (digits.length === 0) {
    return options?.showEmpty ? messages.required : undefined;
  }
  if (!(options?.allowEstablishment ? isValidOwnerId(digits) : isValidPersonId(digits))) {
    return messages.length;
  }
  return undefined;
}

export function getPhoneFieldError(
  phone: string,
  messages: { required: string; length: string },
  options?: { showEmpty?: boolean },
) {
  if (isSaudiMobilePrefixOnly(phone)) {
    return options?.showEmpty ? messages.required : undefined;
  }
  if (!isPhoneComplete(phone)) {
    return messages.length;
  }
  return undefined;
}
