"use client";

import { useId } from "react";

import { Input } from "@/components/ui/input";
import CreateUnitFieldLabel from "@/features/create-unit/components/create-unit-field-label";
import {
  fieldChromeNestedInputClass,
  fieldChromeSurfaceClass,
  resolveFieldChromeState,
} from "@/lib/ui/field-chrome";
import { cn } from "@/lib/utils";
import { toAsciiDigits } from "@/lib/utils/digits";

type CreateUnitNumberFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
};

export default function CreateUnitNumberField({
  label,
  placeholder,
  value,
  onChange,
  errorMessage,
}: CreateUnitNumberFieldProps) {
  const inputId = useId();
  const showInvalid = Boolean(errorMessage);
  const chrome = resolveFieldChromeState({ invalid: showInvalid });

  return (
    <div>
      <CreateUnitFieldLabel label={label} invalid={showInvalid} />

      <div
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-2xl border px-4",
          fieldChromeSurfaceClass(chrome),
        )}
      >
        <span className="shrink-0 text-base font-bold text-brand" aria-hidden="true">
          #
        </span>

        <Input
          id={inputId}
          type="text"
          inputMode="text"
          value={value}
          onChange={(event) => onChange(toAsciiDigits(event.target.value))}
          placeholder={placeholder}
          aria-invalid={showInvalid}
          className={cn(
            "h-auto px-0 text-sm font-semibold",
            fieldChromeNestedInputClass,
          )}
        />
      </div>

      {errorMessage ? (
        <p className="mt-1.5 text-xs font-medium text-[#c62828]">{errorMessage}</p>
      ) : null}
    </div>
  );
}
