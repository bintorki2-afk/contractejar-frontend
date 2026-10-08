"use client";

import type { LucideIcon } from "lucide-react";
import { useId } from "react";

import { Input } from "@/components/ui/input";
import CreateContractFieldLabel from "@/features/create-contract/components/create-contract-field-label";
import { UnifiedRecordHelp } from "@/features/create-contract/components/create-contract-field-help";
import {
  getUnifiedRecordNumberSubscriber,
  toUnifiedRecordNumberInputValue,
  UNIFIED_RECORD_NUMBER_LENGTH,
  UNIFIED_RECORD_NUMBER_PREFIX,
  UNIFIED_RECORD_NUMBER_SUBSCRIBER_LENGTH,
} from "@/lib/validation/format-unified-record-number-for-form";
import {
  fieldChromeIconClass,
  fieldChromeNestedInputClass,
  fieldChromeSurfaceClass,
  resolveFieldChromeState,
} from "@/lib/ui/field-chrome";
import { cn } from "@/lib/utils";
import { digitsOnly } from "@/lib/utils/digits";

type CreateContractUnifiedRecordNumberFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: LucideIcon;
  hint?: string;
  errorMessage?: string;
  invalid?: boolean;
  valid?: boolean;
};

export default function CreateContractUnifiedRecordNumberField({
  label,
  placeholder,
  value,
  onChange,
  icon: Icon,
  hint,
  errorMessage,
  invalid = false,
  valid = false,
}: CreateContractUnifiedRecordNumberFieldProps) {
  const inputId = useId();
  const subscriber = getUnifiedRecordNumberSubscriber(value);
  const digitCount = digitsOnly(value).length;
  const showInvalid = invalid || Boolean(errorMessage);
  const chrome = resolveFieldChromeState({
    invalid: showInvalid,
    valid,
  });

  return (
    <div>
      <CreateContractFieldLabel label={label} invalid={showInvalid}
        help={<UnifiedRecordHelp />}
      />

      <div
        dir="ltr"
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-2xl border px-2",
          fieldChromeSurfaceClass(chrome),
        )}
      >
        <span
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center",
            fieldChromeIconClass(chrome),
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>

        <span className="h-6 w-px shrink-0 bg-[#dcdcdc]" aria-hidden="true" />

        <span className="shrink-0 ps-1 text-sm font-semibold text-foreground">
          {UNIFIED_RECORD_NUMBER_PREFIX}
        </span>

        <Input
          id={inputId}
          type="tel"
          dir="ltr"
          inputMode="numeric"
          maxLength={UNIFIED_RECORD_NUMBER_SUBSCRIBER_LENGTH}
          value={subscriber}
          onChange={(event) => {
            const nextDigits = digitsOnly(event.target.value);
            onChange(
              toUnifiedRecordNumberInputValue(
                `${UNIFIED_RECORD_NUMBER_PREFIX}${nextDigits}`,
              ),
            );
          }}
          placeholder={placeholder}
          aria-invalid={showInvalid}
          className={cn(
            "h-auto min-w-0 flex-1 px-1 text-sm",
            fieldChromeNestedInputClass,
          )}
        />

        <span className="shrink-0 pe-2 text-xs font-semibold text-[#9a9a9a]">
          {digitCount}/{UNIFIED_RECORD_NUMBER_LENGTH}
        </span>
      </div>

      {hint ? (
        <p className="mt-1.5 text-xs leading-5 text-[#9a9a9a]">{hint}</p>
      ) : null}

      {errorMessage ? (
        <p className="mt-1.5 text-xs font-medium text-[#c62828]">{errorMessage}</p>
      ) : null}
    </div>
  );
}
