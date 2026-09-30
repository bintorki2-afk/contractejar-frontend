"use client";

import { useTranslations } from "next-intl";

import CreateContractFieldError from "@/features/create-contract/components/create-contract-field-error";
import CreateContractFieldLabel from "@/features/create-contract/components/create-contract-field-label";
import { InstallmentsHelp } from "@/features/create-contract/components/create-contract-field-help";
import { cn } from "@/lib/utils";

export type FinancePaymentMethodOption = {
  value: string;
  title: string;
  disabled?: boolean;
};

type CreateContractFinancePaymentMethodSelectProps = {
  label: string;
  options: FinancePaymentMethodOption[];
  value: string;
  note?: string;
  disabled?: boolean;
  invalid?: boolean;
  onChange: (value: string) => void;
};

export default function CreateContractFinancePaymentMethodSelect({
  label,
  options,
  value,
  note,
  disabled = false,
  invalid = false,
  onChange,
}: CreateContractFinancePaymentMethodSelectProps) {
  const t = useTranslations("createContract");

  return (
    <div>
      <CreateContractFieldLabel label={label} invalid={invalid}
        help={<InstallmentsHelp />}
      />

      <div
        role="radiogroup"
        aria-label={label}
        aria-invalid={invalid}
        data-field-invalid={invalid ? "true" : undefined}
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => {
          const selected = value === option.value;
          const optionDisabled = disabled || Boolean(option.disabled);

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-disabled={optionDisabled}
              disabled={optionDisabled}
              onClick={() => {
                if (optionDisabled) {
                  return;
                }

                onChange(option.value);
              }}
              className={cn(
                "min-h-10 rounded-2xl border px-3.5 py-2.5 text-center text-xs font-bold transition-colors sm:text-sm",
                selected
                  ? "border-brand bg-brand text-white"
                  : invalid
                    ? "border-[#e57373] bg-[#FBFBFA] text-brand dark:bg-[#121a18]"
                    : "border-[#e8e8e8] bg-[#FBFBFA] text-[#555555] hover:border-brand/30 dark:border-[#2f403b] dark:bg-[#121a18] dark:text-white dark:hover:border-brand-secondary/50",
                optionDisabled &&
                  "pointer-events-none cursor-not-allowed opacity-40",
              )}
            >
              {option.title}
            </button>
          );
        })}
      </div>

      {invalid ? <CreateContractFieldError message={t("fieldRequired")} /> : null}

      {note ? (
        <div className="mt-3 flex items-start gap-2 rounded-2xl bg-[#e9fbf5] px-3.5 py-3 dark:!bg-[#2b2118]">
          <span
            className="mt-1.5 size-2 shrink-0 rounded-full bg-[#e39b2d]"
            aria-hidden="true"
          />
          <p className="text-sm leading-6 font-medium text-[#005848] dark:!text-[#cca352]">
            {note}
          </p>
        </div>
      ) : null}
    </div>
  );
}
