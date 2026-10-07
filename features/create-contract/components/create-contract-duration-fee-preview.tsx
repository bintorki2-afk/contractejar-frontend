"use client";

import { useTranslations } from "next-intl";

import type { PropertyContractType } from "@/features/create-property/utils/contract-type";
import { useContractPricing } from "@/features/pricing/hooks/use-contract-pricing";
import {
  computeContractFee,
  getPricingTier,
} from "@/features/pricing/types/contract-pricing";
import CustomIcon from "@/features/shared/components/custom-icon";

type CreateContractDurationFeePreviewProps = {
  contractType: PropertyContractType;
  /** Total contract length in months; null while no duration is chosen. */
  totalMonths: number | null;
};

function Amount({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 font-extrabold tabular-nums text-brand dark:text-[#48c0b8]">
      {value.toLocaleString("en-US")}
      <CustomIcon src="/icons/ryal.svg" size={14} className="text-brand dark:text-[#48c0b8]" />
    </span>
  );
}

/**
 * Documentation fee for the chosen duration, computed client-side from
 * `GET /pricing` with the rule: ≤ 1 year → first-year price; every extra year
 * or part of it → the extra-year price (1 year + 1 month = 2 billable years).
 */
export default function CreateContractDurationFeePreview({
  contractType,
  totalMonths,
}: CreateContractDurationFeePreviewProps) {
  const t = useTranslations("createContract.finance.contractDuration.feePreview");
  const { pricing } = useContractPricing();

  if (totalMonths === null || totalMonths <= 0) {
    return null;
  }

  const tier = getPricingTier(pricing, contractType);
  const { billableYears, fee } = computeContractFee(tier, totalMonths);
  const extraYears = billableYears - 1;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const durationLabel = [
    years > 0 ? t("years", { count: years }) : null,
    months > 0 ? t("months", { count: months }) : null,
  ]
    .filter(Boolean)
    .join(" + ");

  return (
    <div className="rounded-xl border border-[#d9eadf] bg-[#f3faf5] px-4 py-3 text-sm leading-6 text-[#333333] dark:border-[#2f403b] dark:bg-[#16352f] dark:text-white">
      <div className="flex items-center justify-between gap-3">
        <span className="font-bold">
          {t("total")}{" "}
          <span className="text-xs font-medium text-[#7f7f7f] dark:text-[#9eb5af]">
            ({durationLabel})
          </span>
        </span>
        <Amount value={fee} />
      </div>

      {extraYears > 0 ? (
        <p className="mt-1 text-xs text-[#6f6f6f] dark:text-[#9eb5af]">
          {t("breakdown", {
            firstYear: tier.first_year.toLocaleString("en-US"),
            extraYears,
            extraYear: tier.extra_year.toLocaleString("en-US"),
          })}
        </p>
      ) : null}

      {months > 0 ? (
        <p className="mt-1 text-xs text-[#8a6a3a] dark:text-[#f0b27a]">{t("partYearNote")}</p>
      ) : null}
    </div>
  );
}
