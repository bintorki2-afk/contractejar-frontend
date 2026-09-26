"use client";

import { ArrowUpLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import CustomIcon from "@/features/shared/components/custom-icon";
import { resetCreateContractDraft } from "@/features/create-contract/utils/reset-create-contract-draft";
import type { ContractTypeId } from "@/features/create-contract/types/contract-type";
import { cn } from "@/lib/utils";

type StartWithAqdiContractTypeOptionProps = {
  type: ContractTypeId;
  title: string;
  description: string;
  iconSrc: string;
  iconAlt: string;
  onNavigate: () => void;
};

export default function StartWithAqdiContractTypeOption({
  type,
  title,
  description,
  iconSrc,
  iconAlt,
  onNavigate,
}: StartWithAqdiContractTypeOptionProps) {
  const router = useRouter();

  function handleClick() {
    resetCreateContractDraft();
    onNavigate();
    router.push(`/create-contract?id=${type}`);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-full px-3 py-3 text-start transition-opacity hover:opacity-90 sm:gap-4 sm:px-4 sm:py-3.5",
        type === "residential" ? "bg-brand-background-green" : "bg-[#eef3f8] dark:bg-[#141d1a]",
      )}
    >
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white dark:bg-[#151c1b] sm:size-12">
        <CustomIcon src={iconSrc} size={22} />
        <span className="sr-only">{iconAlt}</span>
      </span>

      <span className="min-w-0 flex-1 space-y-0.5">
        <span className="block text-sm font-bold text-foreground sm:text-base">
          {title}
        </span>
        <span className="block text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {description}
        </span>
      </span>

      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white dark:bg-[#151c1b] sm:size-9">
        <ArrowUpLeft
          className="size-4 text-brand transition-transform duration-300 group-hover:-rotate-45"
          aria-hidden="true"
        />
      </span>
    </button>
  );
}
