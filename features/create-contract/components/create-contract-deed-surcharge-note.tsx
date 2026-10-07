"use client";

import { Info } from "lucide-react";
import { useTranslations } from "next-intl";

import type { DeedTypeId } from "@/features/create-contract/types/deed-type";
import { mapDeedTypeToInstrumentType } from "@/features/create-contract/utils/map-deed-type-to-instrument-type";
import { useContractPricing } from "@/features/pricing/hooks/use-contract-pricing";
import { instrumentTypeHasSurcharge } from "@/features/pricing/types/contract-pricing";
import CustomIcon from "@/features/shared/components/custom-icon";

type CreateContractDeedSurchargeNoteProps = {
  deedType: DeedTypeId | "";
};

/**
 * Small inline note under the deed-type select: the chosen document type
 * carries the one-time document surcharge (amount from `GET /pricing`).
 */
export default function CreateContractDeedSurchargeNote({
  deedType,
}: CreateContractDeedSurchargeNoteProps) {
  const t = useTranslations("createContract.deed.surcharge");
  const { pricing } = useContractPricing();

  if (deedType === "") {
    return null;
  }

  const applies = instrumentTypeHasSurcharge(
    pricing,
    mapDeedTypeToInstrumentType(deedType),
  );

  if (!applies) {
    return null;
  }

  return (
    <p
      role="note"
      className="flex items-start gap-2 rounded-xl border border-[#f1e3c4] bg-[#fdf8ee] px-3 py-2 text-xs leading-5 text-[#6f5b3d] dark:border-[#4a3a22] dark:bg-[#2b2316] dark:text-[#e5c892]"
    >
      <Info className="mt-0.5 size-4 shrink-0 text-[#c9962e]" aria-hidden="true" />
      <span>
        {t("before")}{" "}
        <span className="inline-flex items-center gap-0.5 font-extrabold text-[#8a6a3a] dark:text-[#f0b27a]">
          {pricing.document_surcharge.fee.toLocaleString("en-US")}
          <CustomIcon src="/icons/ryal.svg" size={12} className="text-[#8a6a3a] dark:text-[#f0b27a]" />
        </span>{" "}
        {t("after")}
      </span>
    </p>
  );
}
