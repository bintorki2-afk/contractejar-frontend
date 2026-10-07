import {
  getAgentDataValidationIssues as getContractAgentValidationIssues,
  getOwnerDataValidationIssues as getContractOwnerValidationIssues,
  isAgentDataComplete,
  isOwnerDataComplete as isBaseOwnerDataComplete,
  type OwnerValidationIssue as ContractOwnerValidationIssue,
} from "@/lib/validation/owner-step-validation";

export const HAS_AGENT_OPTIONS = ["yes", "no"] as const;

export type HasAgentOption = (typeof HAS_AGENT_OPTIONS)[number];

export type CalendarType = "hijri" | "gregorian";

export type BirthDateValue = {
  calendarType: CalendarType;
  day: string;
  month: string;
  year: string;
};

export const EMPTY_BIRTH_DATE: BirthDateValue = {
  calendarType: "hijri",
  day: "",
  month: "",
  year: "",
};

export type OwnerDataState = {
  fullName: string;
  idNumber: string;
  birthDate: BirthDateValue;
  phone: string;
  iban: string;
  hasAgent: HasAgentOption | "";
};

export type AgentDataState = {
  idNumber: string;
  birthDate: BirthDateValue;
  phone: string;
  /** PoA (agency) number as written in the instrument. */
  poaNumber: string;
  /** PoA (agency) instrument date, ISO yyyy-mm-dd. */
  poaDate: string;
  powerOfAttorneyFiles: File[];
};

export const EMPTY_OWNER_DATA: OwnerDataState = {
  fullName: "",
  idNumber: "",
  birthDate: EMPTY_BIRTH_DATE,
  phone: "",
  iban: "",
  hasAgent: "no",
};

export const EMPTY_AGENT_DATA: AgentDataState = {
  idNumber: "",
  birthDate: { ...EMPTY_BIRTH_DATE },
  phone: "",
  poaNumber: "",
  poaDate: "",
  powerOfAttorneyFiles: [],
};

export const OWNER_STEP_MAX_PHASE_COUNT = 2;

export function isOwnerDataComplete(ownerData: OwnerDataState) {
  // Owner full name is no longer collected in the form, so it isn't required
  // to continue (the field stays in the data model, defaulting to empty).
  return isBaseOwnerDataComplete({
    ...ownerData,
    // Toggle defaults to off; treat unset as "no".
    hasAgent: ownerData.hasAgent === "yes" ? "yes" : "no",
  });
}

/**
 * Representative (وكيل الورثة / ناظر الوقف) completeness for deceased-owner and
 * waqf deeds: id, birth date, phone and the mandatory capacity document.
 */
export function isRepresentativeDataComplete(agentData: AgentDataState) {
  return isAgentDataComplete(agentData);
}

export {
  getContractAgentValidationIssues,
  getContractOwnerValidationIssues,
  isAgentDataComplete,
  type ContractOwnerValidationIssue,
};

export function getOwnerStepPhaseCount(hasAgent: HasAgentOption | "") {
  return hasAgent === "yes" ? OWNER_STEP_MAX_PHASE_COUNT : 1;
}
