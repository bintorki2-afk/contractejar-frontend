"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import CreateContractContractStartDateFields from "@/features/create-contract/components/create-contract-contract-start-date-fields";
import CreateContractCustomDurationFields, {
  CUSTOM_CONTRACT_DURATION_VALUE,
} from "@/features/create-contract/components/create-contract-custom-duration-fields";
import CreateContractDurationFeePreview from "@/features/create-contract/components/create-contract-duration-fee-preview";
import CreateContractFinanceConditionsSection from "@/features/create-contract/components/create-contract-finance-conditions-section";
import CreateContractFinanceDurationSelect from "@/features/create-contract/components/create-contract-finance-duration-select";
import CreateContractFinancePaymentMethodSelect from "@/features/create-contract/components/create-contract-finance-payment-method-select";
import CreateContractFinancePermissionsSection from "@/features/create-contract/components/create-contract-finance-permissions-section";
import CreateContractRentAmountField from "@/features/create-contract/components/create-contract-rent-amount-field";
import { useContractPeriods } from "@/features/create-contract/hooks/use-contract-periods";
import { usePaymentTypes } from "@/features/create-contract/hooks/use-payment-types";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import type { ContractTypeId } from "@/features/create-contract/types/contract-type";
import { toPropertyContractType } from "@/features/create-contract/types/contract-type";
import {
  isFinancePaymentMethodComplete,
  isFinanceRentComplete,
  isFinanceScheduleComplete,
  type FinanceDataState,
} from "@/features/create-contract/types/finance-step";
import { resolveContractPeriodMonths } from "@/features/create-contract/types/contract-period";
import { parseContractPeriodLabel } from "@/features/create-contract/utils/parse-contract-period-label";
import {
  classifyPaymentTypeName,
  isPaymentTypeAllowedForDuration,
  resolveContractDurationMonths,
} from "@/features/create-contract/utils/payment-type-availability";
import { digitsOnly } from "@/lib/utils/digits";

type CreateContractFinanceDataPhaseProps = {
  labels: CreateContractLabels["finance"];
  contractType: ContractTypeId;
  value: FinanceDataState;
  onChange: (value: FinanceDataState) => void;
  showFieldErrors?: boolean;
};

export default function CreateContractFinanceDataPhase({
  labels,
  contractType,
  value,
  onChange,
  showFieldErrors = false,
}: CreateContractFinanceDataPhaseProps) {
  const apiContractType = toPropertyContractType(contractType);
  const tDuration = useTranslations("createContract.finance.contractDuration");
  const contractPeriodsQuery = useContractPeriods(apiContractType);
  const paymentTypesQuery = usePaymentTypes(apiContractType);

  // Chips are exactly: «سنة» (12 months) / «سنتين» (24 months) / «مدة أخرى».
  const durationOptions = [
    ...(contractPeriodsQuery.data ?? []).map((period) => {
      const months = resolveContractPeriodMonths(period);
      const title =
        months === 12
          ? tDuration("yearChip")
          : months === 24
            ? tDuration("twoYearsChip")
            : parseContractPeriodLabel(period.period).title;

      return { value: String(period.id), title };
    }),
    {
      value: CUSTOM_CONTRACT_DURATION_VALUE,
      title: labels.contractDuration.otherOption,
    },
  ];

  const selectedPeriod = value.isCustomDuration
    ? undefined
    : (contractPeriodsQuery.data ?? []).find(
        (period) => period.id === value.contractPeriodId,
      );
  const selectedPeriodNote = selectedPeriod?.note;

  const durationMonths = resolveContractDurationMonths({
    isCustomDuration: value.isCustomDuration,
    periodMonths: resolveContractPeriodMonths(selectedPeriod),
    periodLabel: selectedPeriod
      ? parseContractPeriodLabel(selectedPeriod.period).title
      : null,
    customYears: value.customDurationYears,
    customMonths: value.customDurationMonths,
  });

  // Total months of the chosen duration for the client-side fee preview.
  const feePreviewMonths: number | null = value.isCustomDuration
    ? typeof value.customDurationYears === "number"
      ? value.customDurationYears * 12 +
        (typeof value.customDurationMonths === "number"
          ? value.customDurationMonths
          : 0)
      : null
    : typeof durationMonths === "number"
      ? durationMonths
      : null;

  const paymentTypeOptions = useMemo(
    () =>
      (paymentTypesQuery.data ?? []).map((paymentType) => {
        const kind = classifyPaymentTypeName(paymentType.name);
        const allowed = isPaymentTypeAllowedForDuration(kind, durationMonths);

        return {
          value: String(paymentType.id),
          title: paymentType.name,
          disabled: !allowed,
        };
      }),
    [paymentTypesQuery.data, durationMonths],
  );

  const selectedPaymentTypeNotes = (paymentTypesQuery.data ?? [])
    .find((paymentType) => paymentType.id === value.paymentTypeId)
    ?.notes?.trim();

  function updateField<K extends keyof FinanceDataState>(
    field: K,
    fieldValue: FinanceDataState[K],
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  function handleDurationChange(nextValue: string) {
    if (nextValue === CUSTOM_CONTRACT_DURATION_VALUE) {
      onChange({
        ...value,
        isCustomDuration: true,
        contractPeriodId: "",
        customDurationYears:
          value.customDurationYears === "" ? 1 : value.customDurationYears,
        customDurationMonths:
          value.customDurationMonths === "" ? 0 : value.customDurationMonths,
        paymentTypeId: "",
      });
      return;
    }

    onChange({
      ...value,
      isCustomDuration: false,
      contractPeriodId: Number(nextValue),
      paymentTypeId: "",
    });
  }

  const durationValue = value.isCustomDuration
    ? CUSTOM_CONTRACT_DURATION_VALUE
    : value.contractPeriodId === ""
      ? ""
      : String(value.contractPeriodId);
  const durationInvalid =
    showFieldErrors &&
    (value.isCustomDuration
      ? !(
          typeof value.customDurationYears === "number" &&
          value.customDurationYears >= 1 &&
          typeof value.customDurationMonths === "number"
        )
      : value.contractPeriodId === "");
  const rentInvalid =
    showFieldErrors &&
    (digitsOnly(value.totalRentAmount).length === 0 ||
      Number(digitsOnly(value.totalRentAmount)) <= 0);
  const paymentInvalid = showFieldErrors && value.paymentTypeId === "";
  const contractStartDateInvalid =
    showFieldErrors &&
    (value.contractStartDate.day === "" ||
      value.contractStartDate.month === "" ||
      value.contractStartDate.year === "");
  const rentValid =
    !rentInvalid &&
    digitsOnly(value.totalRentAmount).length > 0 &&
    Number(digitsOnly(value.totalRentAmount)) > 0;
  const showRentAmount = isFinanceScheduleComplete(value);
  const showPaymentMethod = showRentAmount && isFinanceRentComplete(value);
  const showRemainingSections =
    showPaymentMethod && isFinancePaymentMethodComplete(value);

  return (
    <div className="space-y-3">
      <CreateContractContractStartDateFields
        labels={labels.contractStartDate}
        value={value.contractStartDate}
        onChange={(contractStartDate) =>
          updateField("contractStartDate", contractStartDate)
        }
        invalid={contractStartDateInvalid}
      />

      <div className="space-y-3">
        <CreateContractFinanceDurationSelect
          label={labels.contractDuration.label}
          placeholder={
            contractPeriodsQuery.isLoading
              ? labels.contractDuration.loading
              : labels.selectPlaceholder
          }
          options={durationOptions}
          value={durationValue}
          note={selectedPeriodNote}
          disabled={contractPeriodsQuery.isLoading}
          invalid={durationInvalid}
          onChange={handleDurationChange}
        />

        {value.isCustomDuration ? (
          <div className="rounded-2xl border border-[#e8e8e8] bg-brand-background/40 p-4">
            <CreateContractCustomDurationFields
              labels={labels.contractDuration.custom}
              years={value.customDurationYears}
              months={value.customDurationMonths}
              onYearsChange={(customDurationYears) =>
                updateField("customDurationYears", customDurationYears)
              }
              onMonthsChange={(customDurationMonths) =>
                updateField("customDurationMonths", customDurationMonths)
              }
            />
          </div>
        ) : null}

        <CreateContractDurationFeePreview
          contractType={apiContractType}
          totalMonths={feePreviewMonths}
        />
      </div>

      {contractPeriodsQuery.error ? (
        <p className="text-sm text-destructive">
          {labels.contractDuration.optionsError}
        </p>
      ) : null}

      {showRentAmount ? (
        <CreateContractRentAmountField
          label={labels.totalRentAmount.label}
          placeholder={labels.totalRentAmount.placeholder}
          currency={labels.contractDuration.currency}
          amountInWordsLabel={labels.totalRentAmount.amountInWords}
          value={value.totalRentAmount}
          onChange={(totalRentAmount) =>
            updateField("totalRentAmount", totalRentAmount)
          }
          invalid={rentInvalid}
          valid={rentValid}
        />
      ) : null}

      {showPaymentMethod ? (
        <>
          <CreateContractFinancePaymentMethodSelect
            label={labels.paymentMethod.label}
            options={paymentTypeOptions}
            value={value.paymentTypeId === "" ? "" : String(value.paymentTypeId)}
            note={selectedPaymentTypeNotes}
            disabled={paymentTypesQuery.isLoading}
            invalid={paymentInvalid}
            onChange={(paymentTypeId) =>
              updateField("paymentTypeId", Number(paymentTypeId))
            }
          />

          {paymentTypesQuery.error ? (
            <p className="text-sm text-destructive">
              {labels.paymentMethod.optionsError}
            </p>
          ) : null}
        </>
      ) : null}

      {showRemainingSections ? (
        <div className="space-y-4 pt-2">
          <CreateContractFinancePermissionsSection
            labels={labels.tenantPermissions}
            value={value.selectedTenantRoleIds}
            values={value.tenantRoleValues}
            onChange={({ selectedTenantRoleIds, tenantRoleValues }) =>
              onChange({
                ...value,
                selectedTenantRoleIds,
                tenantRoleValues,
                addTenantPermissions: selectedTenantRoleIds.length > 0,
              })
            }
          />

          <CreateContractFinanceConditionsSection
            labels={labels.otherConditions}
            enabled={value.addOtherConditions}
            value={value.otherConditionsList}
            onEnabledChange={(addOtherConditions) =>
              onChange({
                ...value,
                addOtherConditions,
              })
            }
            onChange={(otherConditionsList) =>
              onChange({
                ...value,
                otherConditionsList,
                addOtherConditions: otherConditionsList.some(
                  (item) => item.trim() !== "",
                ),
              })
            }
          />
        </div>
      ) : null}
    </div>
  );
}
