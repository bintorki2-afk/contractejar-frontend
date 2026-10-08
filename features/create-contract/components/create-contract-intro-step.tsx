"use client";
import {
  ArrowUpLeft,
  Building2,
  CircleDollarSign,
  Hand,
  Home,
  Loader2,
  MessageCircle,
  UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import CreateContractPaperworkIcon from "@/features/create-contract/components/create-contract-paperwork-icon";
import CreateContractPriceSheetDialog from "@/features/create-contract/components/create-contract-price-sheet-dialog";
import CreateContractRequirementItem from "@/features/create-contract/components/create-contract-requirement-item";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import {
  toPropertyContractType,
  type ContractTypeId,
} from "@/features/create-contract/types/contract-type";
import { usePaperwork } from "@/features/create-contract/hooks/use-paperwork";
import { useContractPricing } from "@/features/pricing/hooks/use-contract-pricing";
import { getPricingTier } from "@/features/pricing/types/contract-pricing";
import CustomIcon from "@/features/shared/components/custom-icon";
import { useState } from "react";

type CreateContractIntroStepProps = {
  labels: CreateContractLabels["intro"];
  stepperLabels: CreateContractLabels["stepper"];
  contractType: ContractTypeId;
  prices: CreateContractLabels["prices"];
  onStart: () => void | Promise<void>;
  isStarting?: boolean;
};

const requirementIcons = [
  UserCheck,
  Building2,
  Home,
  CircleDollarSign,
  MessageCircle,
  UserCheck,
] as const;

export default function CreateContractIntroStep({
  labels,
  contractType,
  prices,
  onStart,
  isStarting = false,
}: CreateContractIntroStepProps) {
  const [open, setOpen] = useState(false);

  const propertyContractType = toPropertyContractType(contractType);

  const { data: paperwork, isLoading } = usePaperwork(propertyContractType);

  // Single source for the yearly price: `GET /pricing` (static labels are the
  // last-resort fallback while it loads).
  const { pricing, isFallback: isPricingFallback } = useContractPricing();
  const price = isPricingFallback
    ? prices[contractType]
    : String(getPricingTier(pricing, propertyContractType).first_year);

  const fallbackRequirements = labels.requirements.slice(0, -1);
  const hasApiItems = Boolean(paperwork && paperwork.length > 0);

  return (
    <div className="space-y-3 p-3 md:space-y-4 md:p-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="mb-2 inline-flex text-brand dark:text-[#48c0b8]">
          <Hand className="size-6" aria-hidden="true" />
        </span>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-brand md:text-3xl dark:text-[#48c0b8]">
            {labels.title}
          </h2>
          <p className="text-sm text-[#7f7f7f] dark:text-[#9eb5af]">
            {labels.subtitle}
          </p>
        </div>
      </div>

      <div>
        {isLoading && !hasApiItems ? (
          <div className="space-y-2 py-2">
            {fallbackRequirements.map((_, index) => (
              <div key={index} className="flex items-center gap-3 py-2">
                <span className="size-8 shrink-0 animate-pulse rounded-full bg-[#ececec] dark:bg-[#24302c]" />
                <span className="h-4 flex-1 animate-pulse rounded bg-[#ececec] dark:bg-[#24302c]" />
              </div>
            ))}
          </div>
        ) : null}

        {hasApiItems
          ? paperwork!.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 border-b border-[#ececec] py-2 last:border-b-0 dark:border-[#2f403b]"
              >
                <span className="inline-flex size-8 shrink-0 items-center justify-center">
                  <CreateContractPaperworkIcon src={item.icon} />
                </span>

                <p className="flex-1 font-medium text-[#333333] dark:text-white">
                  {item.name}
                </p>
              </div>
            ))
          : null}

        {!isLoading && !hasApiItems
          ? fallbackRequirements.map((text, index) => (
              <CreateContractRequirementItem
                key={text}
                text={text}
                icon={requirementIcons[index]}
              />
            ))
          : null}
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-brand-secondary/30 bg-brand-background-green px-5 py-4 dark:border-[#2f403b] dark:bg-[#16352f]">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-[#333333] dark:text-[#9eb5af]">
              {labels.priceLabel}
            </p>

            <p className="flex items-center gap-1 text-xl font-extrabold text-brand dark:text-[#48c0b8]">
              {price}
              <CustomIcon
                src="/icons/ryal.svg"
                size={24}
                className="text-brand dark:text-[#48c0b8]"
              />
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full cursor-pointer items-center justify-center gap-1 py-1 text-sm font-medium text-brand dark:text-[#48c0b8]"
        >
          {labels.viewAllPrices}
          <ArrowUpLeft className="size-4" aria-hidden="true" />
        </button>

        <CreateContractPriceSheetDialog
          open={open}
          onOpenChange={setOpen}
          contractType={contractType}
        />

        <Button
          type="button"
          onClick={() => void onStart()}
          disabled={isStarting}
          className="h-12 w-full gap-2 rounded-xl bg-linear-to-br from-brand-secondary via-brand to-brand text-base font-extrabold text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isStarting ? (
            <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden="true" />
          ) : null}
          {isStarting ? labels.startContractLoading : labels.start}
        </Button>
      </div>
    </div>
  );
}
