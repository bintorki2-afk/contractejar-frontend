"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId } from "react";

import { Input } from "@/components/ui/input";
import CreateContractFieldError from "@/features/create-contract/components/create-contract-field-error";
import CreateContractFieldLabel from "@/features/create-contract/components/create-contract-field-label";
import { numberToArabicWords } from "@/features/create-contract/utils/number-to-arabic-words";
import {
  fieldChromeNestedInputClass,
  fieldChromeSurfaceClass,
  resolveFieldChromeState,
} from "@/lib/ui/field-chrome";
import { cn } from "@/lib/utils";

type CreateContractRentAmountFieldProps = {
  label: string;
  placeholder: string;
  currency?: string;
  amountInWordsLabel?: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  valid?: boolean;
};

function formatRentAmount(value: string) {
  const digits = value.replace(/[٠-٩۰-۹]/g, (d) => "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹".indexOf(d) % 10 + "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return Number(digits).toLocaleString("en-US");
}

export default function CreateContractRentAmountField({
  label,
  placeholder,
  currency = "ريال",
  amountInWordsLabel,
  value,
  onChange,
  invalid = false,
  valid = false,
}: CreateContractRentAmountFieldProps) {
  const t = useTranslations("createContract");
  const locale = useLocale();
  const inputId = useId();
  const chrome = resolveFieldChromeState({ invalid, valid });
  const numericValue = Number(value.replace(/[٠-٩۰-۹]/g, (d) => "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹".indexOf(d) % 10 + "").replace(/\D/g, ""));
  // Spell the amount in Arabic words only in Arabic; in English show the
  // formatted numeral so the helper line reads naturally in each language.
  const amountText =
    locale === "ar"
      ? `${numberToArabicWords(numericValue)} ${currency}`
      : `${numericValue.toLocaleString("en-US")} ${currency}`;
  const amountInWords =
    amountInWordsLabel && numericValue > 0
      ? amountInWordsLabel.replace("{amount}", amountText)
      : null;

  return (
    <div>
      <CreateContractFieldLabel label={label} invalid={invalid} />

      <div
        dir="ltr"
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-2xl border px-4",
          fieldChromeSurfaceClass(chrome),
        )}
      >
        <span className="shrink-0 text-sm font-bold text-brand">{currency}</span>

        <span className="h-6 w-px shrink-0 bg-[#dcdcdc]" aria-hidden="true" />

        <Input
          id={inputId}
          type="text"
          inputMode="numeric"
          dir="ltr"
          value={formatRentAmount(value)}
          onChange={(event) => {
            // Cap at 12 digits: beyond ~15 digits `Number()` loses precision and
            // the displayed amount / words no longer match what was typed.
            onChange(event.target.value.replace(/[٠-٩۰-۹]/g, (d) => "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹".indexOf(d) % 10 + "").replace(/\D/g, "").slice(0, 12));
          }}
          placeholder={placeholder}
          aria-invalid={invalid}
          className={cn(
            "h-auto px-1 text-sm font-semibold",
            fieldChromeNestedInputClass,
          )}
        />
      </div>

      {invalid ? <CreateContractFieldError message={t("fieldRequired")} /> : null}

      {amountInWords ? (
        <p className="mt-2 text-xs leading-5 text-[#9a9a9a]">{amountInWords}</p>
      ) : null}
    </div>
  );
}
