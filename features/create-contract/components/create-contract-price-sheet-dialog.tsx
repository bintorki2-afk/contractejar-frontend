"use client";

import { Building2, FileText, Gauge, Home, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ContractTypeId } from "@/features/create-contract/types/contract-type";
import { DEED_TYPES, type DeedTypeId } from "@/features/create-contract/types/deed-type";
import { mapInstrumentTypeToDeedType } from "@/features/create-contract/utils/map-instrument-type-to-deed-type";
import { useContractPricing } from "@/features/pricing/hooks/use-contract-pricing";
import type { ContractPricing } from "@/features/pricing/types/contract-pricing";
import CustomIcon from "@/features/shared/components/custom-icon";
import { cn } from "@/lib/utils";

type CreateContractPriceSheetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The contract type the customer is creating — its card is highlighted. */
  contractType: ContractTypeId;
};

function Amount({
  value,
  className,
  iconSize = 16,
}: {
  value: number;
  className?: string;
  iconSize?: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-extrabold tabular-nums text-brand dark:text-[#48c0b8]",
        className,
      )}
    >
      {value.toLocaleString("en-US")}
      <CustomIcon
        src="/icons/ryal.svg"
        size={iconSize}
        className="shrink-0 text-brand dark:text-[#48c0b8]"
      />
    </span>
  );
}

function PriceCard({
  icon,
  title,
  firstYear,
  extraYear,
  highlighted,
  labels,
}: {
  icon: ReactNode;
  title: string;
  firstYear: number;
  extraYear: number;
  highlighted: boolean;
  labels: { yearOrLess: string; extraYear: string };
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-3.5",
        highlighted
          ? "border-brand-secondary/50 bg-brand-background-green dark:border-brand-secondary/40 dark:bg-[#16352f]"
          : "border-[#ececec] bg-white dark:border-[#2f403b] dark:bg-[#121a18]",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-white text-brand shadow-sm dark:bg-[#1a2421] dark:text-[#48c0b8]">
          {icon}
        </span>
        <p className="text-sm font-extrabold text-brand dark:text-[#48c0b8]">
          {title}
        </p>
      </div>

      <dl className="mt-3 space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <dt className="text-xs leading-5 text-[#555555] dark:text-[#9eb5af]">
            {labels.yearOrLess}
          </dt>
          <dd>
            <Amount value={firstYear} className="text-base" iconSize={18} />
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3 border-t border-dashed border-[#d9d9d9] pt-2.5 dark:border-[#2f403b]">
          <dt className="text-xs leading-5 text-[#555555] dark:text-[#9eb5af]">
            {labels.extraYear}
          </dt>
          <dd>
            <Amount value={extraYear} className="text-sm" />
          </dd>
        </div>
      </dl>
    </div>
  );
}

function resolveSurchargeDeedLabels(
  pricing: ContractPricing,
  deedTypeLabel: (deedType: DeedTypeId) => string,
): string[] {
  const seen = new Set<DeedTypeId>();

  for (const instrumentType of pricing.document_surcharge.instrument_types) {
    const deedType = mapInstrumentTypeToDeedType(instrumentType);
    if (deedType !== "" && DEED_TYPES.includes(deedType)) {
      seen.add(deedType);
    }
  }

  // Keep the wizard's own ordering so the list reads the same as the dropdown.
  return DEED_TYPES.filter((deedType) => seen.has(deedType)).map(deedTypeLabel);
}

/**
 * «عرض جميع الأسعار» — a clean price sheet driven entirely by `GET /pricing`:
 * one card per contract type, the document surcharge with the deed types it
 * applies to, meter-transfer fees, and the "includes Ejar fees" footer.
 */
export default function CreateContractPriceSheetDialog({
  open,
  onOpenChange,
  contractType,
}: CreateContractPriceSheetDialogProps) {
  const t = useTranslations("createContract.intro.priceDialog");
  const tDeedTypes = useTranslations("createContract.deed.deedType.types");
  const { pricing } = useContractPricing();

  const surchargeDeedLabels = resolveSurchargeDeedLabels(pricing, (deedType) =>
    tDeedTypes(deedType),
  );
  const yearLabels = { yearOrLess: t("yearOrLess"), extraYear: t("extraYear") };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[92dvh] gap-0 overflow-y-auto rounded-3xl p-5 sm:max-w-lg dark:bg-[#1a2421]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#ececec] pb-3 dark:border-[#2f403b]">
          <div>
            <DialogTitle className="text-base font-extrabold leading-snug text-brand dark:text-[#48c0b8]">
              {t("title")}
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs leading-relaxed text-[#7f7f7f] dark:text-[#9eb5af]">
              {pricing.rule}
            </DialogDescription>
          </div>

          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-[#24302c]"
              aria-label={t("close")}
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          </DialogClose>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PriceCard
            icon={<Home className="size-4" aria-hidden="true" />}
            title={t("residentialTitle")}
            firstYear={pricing.housing.first_year}
            extraYear={pricing.housing.extra_year}
            highlighted={contractType === "residential"}
            labels={yearLabels}
          />
          <PriceCard
            icon={<Building2 className="size-4" aria-hidden="true" />}
            title={t("commercialTitle")}
            firstYear={pricing.commercial.first_year}
            extraYear={pricing.commercial.extra_year}
            highlighted={contractType === "commercial"}
            labels={yearLabels}
          />
        </div>

        <div className="mt-3 space-y-3">
          <div className="rounded-2xl border border-[#ececec] p-3.5 dark:border-[#2f403b]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                <FileText
                  className="mt-0.5 size-4 shrink-0 text-brand-secondary"
                  aria-hidden="true"
                />
                <p className="text-sm font-bold leading-5 text-[#333333] dark:text-white">
                  {t("surchargeLabel")}
                </p>
              </div>
              <p className="shrink-0 text-end">
                <Amount value={pricing.document_surcharge.fee} className="text-sm" />
                <span className="block text-[11px] text-[#9a9a9a] dark:text-[#9eb5af]">
                  {t("surchargeOnce")}
                </span>
              </p>
            </div>
            {surchargeDeedLabels.length > 0 ? (
              <ul className="mt-2.5 flex flex-wrap gap-1.5 ps-6">
                {surchargeDeedLabels.map((label) => (
                  <li
                    key={label}
                    className="rounded-full bg-brand-background px-2.5 py-1 text-[11px] font-semibold text-[#555555] dark:bg-[#24302c] dark:text-[#9eb5af]"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="rounded-2xl border border-[#ececec] p-3.5 dark:border-[#2f403b]">
            <div className="flex items-start gap-2">
              <Gauge
                className="mt-0.5 size-4 shrink-0 text-brand-secondary"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-5 text-[#333333] dark:text-white">
                  {t("meterTransferLabel")}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#555555] dark:text-[#9eb5af]">
                  <span className="inline-flex items-center gap-1.5">
                    {t("residentialTitle")}:
                    <Amount
                      value={pricing.meter_transfer_fee.housing.electricity}
                      className="text-xs"
                      iconSize={13}
                    />
                    <span className="text-[#9a9a9a]">{t("perMeter")}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    {t("commercialTitle")}:
                    <Amount
                      value={pricing.meter_transfer_fee.commercial.electricity}
                      className="text-xs"
                      iconSize={13}
                    />
                    <span className="text-[#9a9a9a]">{t("perMeter")}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-brand-background-green px-4 py-3 dark:bg-[#16352f]">
          <p className="text-center text-xs font-bold leading-5 text-brand dark:text-[#48c0b8]">
            {pricing.note || t("footerNote")}
          </p>
          <Image
            src="/images/ejar.png"
            alt={t("ejarLogoAlt")}
            width={88}
            height={32}
            className="h-6 w-auto shrink-0 object-contain dark:brightness-125"
          />
        </div>

        <DialogClose asChild>
          <Button
            type="button"
            className="mt-4 h-11 w-full rounded-full bg-[#ececec] text-sm font-semibold text-[#666666] hover:bg-brand hover:text-white dark:bg-[#24302c] dark:text-[#9eb5af] dark:hover:bg-[#0f6b5c] dark:hover:text-white"
          >
            {t("close")}
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
