"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { MY_PROPERTY_EJAR_LOGO } from "@/features/my-properties/data/my-property-actions-config";
import type { PropertyUnitTab } from "@/features/property-units/types/property-unit";

type PropertyUnitsSelectionBarProps = {
  count: number;
  activeTab: PropertyUnitTab;
  isStarting: boolean;
  onCancel: () => void;
  onCreateContract: () => void;
};

export default function PropertyUnitsSelectionBar({
  count,
  activeTab,
  isStarting,
  onCancel,
  onCreateContract,
}: PropertyUnitsSelectionBarProps) {
  const t = useTranslations("propertyUnits.selection");

  if (count < 1) {
    return null;
  }

  const countLabel =
    activeTab === "residential"
      ? t("selectedResidential", { count })
      : t("selectedCommercial", { count });

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-safe-4 z-40 px-4 sm:bottom-6">
      <div className="pointer-events-auto mx-auto flex max-w-4xl flex-col gap-3 rounded-[28px] border border-[#ececec] bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-4">
        <p className="text-center text-sm font-bold text-brand sm:text-start">
          {countLabel}
        </p>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isStarting}
            className="h-12 flex-1 rounded-full px-4 text-sm font-semibold text-[#7f7f7f] transition-colors hover:bg-[#f5f5f5] disabled:opacity-60 sm:flex-none"
          >
            {t("cancelSelection")}
          </button>

          <button
            type="button"
            onClick={onCreateContract}
            disabled={isStarting || count < 1}
            className="flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-full bg-linear-to-l from-brand-secondary to-brand px-4 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:min-w-[220px]"
          >
            <span>
              {isStarting ? t("starting") : t("createContractOnSelected")}
            </span>
            <span className="relative hidden h-6 w-12 shrink-0 sm:block">
              <Image
                src={MY_PROPERTY_EJAR_LOGO}
                alt=""
                fill
                sizes="48px"
                className="object-contain object-center"
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
