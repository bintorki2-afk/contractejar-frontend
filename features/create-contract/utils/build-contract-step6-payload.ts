import type { FinanceDataState } from "@/features/create-contract/types/finance-step";
import { getFilledOtherConditions } from "@/features/create-contract/types/finance-step";
import type { TenantRole } from "@/features/create-contract/types/tenant-role";
import {
  buildStep6TenantPayload,
  isDailyFineRole,
  isSecurityDepositRole,
} from "@/features/create-contract/utils/tenant-role-helpers";
import {
  formatPropertyOwnerDatePart,
  formatPropertyOwnerYear,
} from "@/features/create-property/utils/property-owner-api";
import { digitsOnly } from "@/lib/utils/digits";

export type ContractStep6Payload = {
  contractId: number;
  financeData: FinanceDataState;
  roles?: TenantRole[];
};

export function buildContractStep6Body({
  contractId,
  financeData,
  roles = [],
}: ContractStep6Payload) {
  const { contractStartDate } = financeData;

  if (financeData.paymentTypeId === "") {
    throw new Error("Payment type is required");
  }

  const hasPresetDuration = financeData.contractPeriodId !== "";
  const hasCustomDuration =
    financeData.isCustomDuration &&
    typeof financeData.customDurationYears === "number" &&
    typeof financeData.customDurationMonths === "number";

  if (!hasPresetDuration && !hasCustomDuration) {
    throw new Error("Contract duration is required");
  }

  const tenantPayload = buildStep6TenantPayload(
    financeData.selectedTenantRoleIds,
    financeData.tenantRoleValues,
    roles,
  );
  const otherConditionsList = getFilledOtherConditions(
    financeData.otherConditionsList,
  );
  const hasOtherConditions = otherConditionsList.length > 0;

  const body: Record<
    string,
    string | number | boolean | number[] | string[] | Record<string, string>
  > = {
    id: contractId,
    app_or_web: "web",
    type_contract_starting_date: contractStartDate.calendarType,
    contract_starting_date_day: formatPropertyOwnerDatePart(contractStartDate.day),
    contract_starting_date_month: formatPropertyOwnerDatePart(
      contractStartDate.month,
    ),
    contract_starting_date_year: formatPropertyOwnerYear(contractStartDate.year),
    payment_type_id: financeData.paymentTypeId,
    conditions: hasOtherConditions,
    tenant_roles: tenantPayload.tenant_roles,
    additional_terms: hasOtherConditions,
  };

  // The rent amount (إجمالي الإيجار) is collected and required on the finance
  // step but was never sent, so `annual_rent_amount_for_the_unit` stayed empty
  // on the server and the dashboard showed no contract amount (#1).
  const rentDigits = digitsOnly(financeData.totalRentAmount);
  if (rentDigits && Number(rentDigits) > 0) {
    body.annual_rent_amount_for_the_unit = Number(rentDigits);
  }

  if (financeData.isCustomDuration && hasCustomDuration) {
    body.duration_preset = "other";
    body.duration_years = financeData.customDurationYears;
    body.duration_months = financeData.customDurationMonths;
  } else {
    body.contract_term_in_years = financeData.contractPeriodId as number;
  }

  if (tenantPayload.tenant_role_ids.length > 0) {
    body.tenant_role_ids = tenantPayload.tenant_role_ids;
  }

  if (Object.keys(tenantPayload.tenant_role_values).length > 0) {
    body.tenant_role_values = tenantPayload.tenant_role_values;
  }

  if (hasOtherConditions) {
    body.other_conditions_list = otherConditionsList;
    // الشرط الإضافي — also send joined text for the legacy key.
    body.other_conditions = otherConditionsList.join("\n");
  }

  // #7: map the security-deposit (الضمان) and daily-fine (الغرامة) tenant roles
  // to their dedicated backend keys, in addition to tenant_role_values.
  const rolesById = new Map(roles.map((role) => [role.id, role]));
  for (const id of financeData.selectedTenantRoleIds) {
    const role = rolesById.get(id);
    if (!role) {
      continue;
    }

    const rawValue = financeData.tenantRoleValues[String(id)]?.trim() ?? "";
    if (!rawValue) {
      continue;
    }

    if (isSecurityDepositRole(role)) {
      body.Guarantee_amount = rawValue;
    } else if (isDailyFineRole(role)) {
      body.daily_fine = rawValue;
    }
  }

  return body;
}
