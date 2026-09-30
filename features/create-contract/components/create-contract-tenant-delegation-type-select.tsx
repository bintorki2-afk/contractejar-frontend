"use client";

import { Briefcase, ScrollText } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import CreateContractFieldError from "@/features/create-contract/components/create-contract-field-error";
import CreateContractFieldLabel from "@/features/create-contract/components/create-contract-field-label";
import { DelegationHelp } from "@/features/create-contract/components/create-contract-field-help";
import {
  DELEGATION_TYPE_OPTIONS,
  type DelegationTypeOption,
} from "@/features/create-contract/types/tenant-step";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import { cn } from "@/lib/utils";

type CreateContractTenantDelegationTypeSelectProps = {
  labels: CreateContractLabels["tenant"]["organizationData"]["delegationType"];
  value: DelegationTypeOption | "";
  onChange: (value: DelegationTypeOption | "") => void;
  invalid?: boolean;
};

const DELEGATION_ICONS: Record<DelegationTypeOption, ReactNode> = {
  "owner-representative": (
    <Briefcase className="size-7 text-[#8a6a3a]" aria-hidden />
  ),
  "agent-authorized": (
    <ScrollText className="size-7 text-[#6b5b95]" aria-hidden />
  ),
};

export default function CreateContractTenantDelegationTypeSelect({
  labels,
  value,
  onChange,
  invalid = false,
}: CreateContractTenantDelegationTypeSelectProps) {
  const t = useTranslations("createContract");

  return (
    <div>
      <CreateContractFieldLabel label={labels.label} invalid={invalid}
        help={<DelegationHelp />}
      />

      <div
        role="radiogroup"
        aria-label={labels.label}
        aria-invalid={invalid}
        data-field-invalid={invalid ? "true" : undefined}
        className="grid grid-cols-2 gap-2 sm:gap-3"
      >
        {DELEGATION_TYPE_OPTIONS.map((delegationType) => {
          const selected = value === delegationType;
          const option = labels.options[delegationType];

          return (
            <button
              key={delegationType}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(delegationType)}
              className={cn(
                "relative flex min-w-0 flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-center transition-colors sm:gap-2.5 sm:px-4 sm:py-5",
                selected
                  ? "border-brand bg-brand-background-green"
                  : invalid
                    ? "border-[#e57373] bg-white"
                    : "border-[#e8e8e8] bg-white hover:border-brand/30",
              )}
            >
              {"badge" in option && option.badge ? (
                <span className="absolute inset-s-1.5 top-0 -translate-y-1/2 rounded-full bg-[#ffe8d6] px-1.5 py-0.5 text-[9px] font-bold text-[#b86a3a] sm:inset-s-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
                  {option.badge}
                </span>
              ) : null}

              <span className="flex size-9 items-center justify-center sm:size-11 [&_svg]:size-5 sm:[&_svg]:size-7">
                {DELEGATION_ICONS[delegationType]}
              </span>
              <span className="text-xs font-extrabold text-brand sm:text-sm">
                {option.title}
              </span>
              <span className="text-[11px] leading-4 text-[#9a9a9a] sm:text-xs sm:leading-5">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

      {invalid ? <CreateContractFieldError message={t("fieldRequired")} /> : null}
    </div>
  );
}
