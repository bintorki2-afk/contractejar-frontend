"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { MY_PROPERTY_EJAR_LOGO } from "@/features/my-properties/data/my-property-actions-config";
import type { PropertyUnitCardData } from "@/features/property-units/types/property-unit";

type PropertyUnitCardFooterProps = {
  unit: PropertyUnitCardData;
  disabled?: boolean;
  isStarting?: boolean;
  onCreateContract: (unit: PropertyUnitCardData) => void;
};

export default function PropertyUnitCardFooter({
  unit,
  disabled = false,
  isStarting = false,
  onCreateContract,
}: PropertyUnitCardFooterProps) {
  const t = useTranslations("propertyUnits.card");

  const contractLabel =
    unit.category === "residential"
      ? t("createResidentialContract")
      : t("createCommercialContract");

  return (
    <div className="space-y-4 pt-2">
      <button
        type="button"
        disabled={disabled || isStarting}
        onClick={() => onCreateContract(unit)}
        className="flex h-14 w-full items-center justify-between rounded-[20px] bg-linear-to-l from-brand-secondary to-brand px-4 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex-1 text-center leading-6">
          {isStarting ? t("startContractLoading") : contractLabel}
        </span>
        <span className="flex h-9 shrink-0 items-center rounded-xl bg-white px-2.5 shadow-sm">
          <span className="relative h-5 w-12">
            <Image
              src={MY_PROPERTY_EJAR_LOGO}
              alt={t("ejarLogoAlt")}
              fill
              sizes="48px"
              className="object-contain object-center"
            />
          </span>
        </span>
      </button>
    </div>
  );
}
