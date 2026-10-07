"use client";

import type { LucideIcon } from "lucide-react";
import { useId } from "react";

import { Input } from "@/components/ui/input";
import CreateUnitFieldLabel from "@/features/create-unit/components/create-unit-field-label";
import {
  fieldChromeNestedInputClass,
  fieldChromeSurfaceClass,
  resolveFieldChromeState,
} from "@/lib/ui/field-chrome";
import { cn } from "@/lib/utils";

type CreateUnitIconInputFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: LucideIcon;
  type?: "text" | "tel";
  dir?: "ltr" | "rtl";
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  required?: boolean;
  hideLabel?: boolean;
  errorMessage?: string;
};

export default function CreateUnitIconInputField({
  label,
  placeholder,
  value,
  onChange,
  icon: Icon,
  type = "text",
  dir,
  inputMode,
  maxLength,
  required = true,
  hideLabel = false,
  errorMessage,
}: CreateUnitIconInputFieldProps) {
  const inputId = useId();
  const showInvalid = Boolean(errorMessage);
  const chrome = resolveFieldChromeState({ invalid: showInvalid });

  return (
    <div>
      {hideLabel ? null : (
        required ? (
          <CreateUnitFieldLabel label={label} invalid={showInvalid} />
        ) : (
          <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
            {label}
          </label>
        )
      )}

      <div
        dir={dir}
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-full border px-2",
          showInvalid
            ? fieldChromeSurfaceClass(chrome)
            : "border-[#e8e8e8] bg-[#FBFBFA] dark:border-[#2f403b] dark:bg-[#0d1614]",
        )}
      >
        <span className="inline-flex size-10 shrink-0 items-center justify-center text-brand-secondary">
          <Icon className="size-5" aria-hidden="true" />
        </span>

        <span className="h-6 w-px shrink-0 bg-[#dcdcdc] dark:bg-[#2f403b]" aria-hidden="true" />

        <Input
          id={inputId}
          type={type}
          dir={dir}
          inputMode={inputMode}
          maxLength={maxLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={showInvalid}
          className={cn(
            "h-auto px-2 text-sm",
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
