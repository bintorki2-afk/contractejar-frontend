"use client";

import { Building2, Home, X } from "lucide-react";
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
import { useContractPricing } from "@/features/pricing/hooks/use-contract-pricing";
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
  const { pricing } = useContractPricing();

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

        <div className="mt-4">
          {contractType === "commercial" ? (
            <PriceCard
              icon={<Building2 className="size-4" aria-hidden="true" />}
              title={t("commercialTitle")}
              firstYear={pricing.commercial.first_year}
              extraYear={pricing.commercial.extra_year}
              highlighted
              labels={yearLabels}
            />
          ) : (
            <PriceCard
              icon={<Home className="size-4" aria-hidden="true" />}
              title={t("residentialTitle")}
              firstYear={pricing.housing.first_year}
              extraYear={pricing.housing.extra_year}
              highlighted
              labels={yearLabels}
            />
          )}
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
