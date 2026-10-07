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

type CreateUnitAreaFieldProps = {
  label: string;
  placeholder: string;
  suffix: string;
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
};

export default function CreateUnitAreaField({
  label,
  placeholder,
  suffix,
  value,
  onChange,
  errorMessage,
}: CreateUnitAreaFieldProps) {
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
        <Input
          id={inputId}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value
              .replace(/٫/g, ".")
              .replace(/[^\d.]/g, "");
            onChange(nextValue);
          }}
          placeholder={placeholder}
          aria-invalid={showInvalid}
          className={cn(
            "h-auto px-0 text-sm font-semibold",
            fieldChromeNestedInputClass,
          )}
        />

        <span className="shrink-0 text-sm font-bold text-brand">{suffix}</span>
      </div>

      {errorMessage ? (
        <p className="mt-1.5 text-xs font-medium text-[#c62828]">{errorMessage}</p>
      ) : null}
    </div>
  );
}
