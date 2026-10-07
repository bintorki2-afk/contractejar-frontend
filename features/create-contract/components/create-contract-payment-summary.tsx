"use client";

import CreateContractFinancialBreakdown from "@/features/create-contract/components/create-contract-financial-breakdown";
import { useContractFinanceSummary } from "@/features/create-contract/hooks/use-contract-finance-summary";
import { useContractPeriods } from "@/features/create-contract/hooks/use-contract-periods";
import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import type { AppliedContractCoupon } from "@/features/create-contract/types/contract-coupon";
import type { ContractTypeId } from "@/features/create-contract/types/contract-type";
import { toPropertyContractType } from "@/features/create-contract/types/contract-type";
import { formatContractDurationLabel } from "@/features/create-contract/utils/format-contract-duration-label";
import { useTranslations } from "next-intl";

type CreateContractPaymentSummaryProps = {
  labels: CreateContractLabels["payment"]["summary"];
  contractType: ContractTypeId;
  appliedCoupon?: AppliedContractCoupon | null;
};

export default function CreateContractPaymentSummary({
  labels,
  contractType,
  appliedCoupon = null,
}: CreateContractPaymentSummaryProps) {
  const contractUuid = useCreateContractDraftStore(
    (state) =>
      state.contractSession?.uuid ??
      state.contractStep1Data?.uuid ??
      null,
  );
  const financeData = useCreateContractDraftStore((state) => state.financeData);
  const { data, isLoading } = useContractFinanceSummary(contractUuid);
  const contractPeriodsQuery = useContractPeriods(
    toPropertyContractType(contractType),
  );
  const tReview = useTranslations("createContract.review");

  const contractTypeLabel =
    contractType === "commercial"
      ? labels.contractTypeCommercial
      : labels.contractTypeResidential;

  const durationLabel = formatContractDurationLabel(
    financeData,
    contractPeriodsQuery.data ?? [],
    {
      yearsCount: labels.yearsCount,
      monthsCount: labels.monthsCount,
      oneYear: tReview("durationOneYear"),
      twoYears: tReview("durationTwoYears"),
    },
  );

  const feeSubtitle = [contractTypeLabel, durationLabel || null]
    .filter((part): part is string => Boolean(part))
    .join(" - ");

  return (
    <CreateContractFinancialBreakdown
      labels={labels}
      contractType={contractType}
      data={data}
      isLoading={isLoading}
      appliedCoupon={appliedCoupon}
      sectionTitle={labels.sectionTitle}
      feeSubtitle={feeSubtitle}
    />
  );
}
