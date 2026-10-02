"use client";

import { Mail } from "lucide-react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AuthEmailFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder: string;
};

/** Shared email input for the auth forms (login / register / forgot password). */
export default function AuthEmailField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
}: AuthEmailFieldProps<T>) {
  const id = String(name);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>
            {label}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute inset-s-4 top-1/2 size-4 -translate-y-1/2 text-black"
              aria-hidden="true"
            />
            <Input
              {...field}
              id={id}
              type="email"
              dir="ltr"
              inputMode="email"
              autoComplete="email"
              aria-invalid={fieldState.invalid}
              placeholder={placeholder}
              className={cn(
                "h-14 rounded-full border-[#d6d6d6] bg-[#f7f7f7] pe-4 ps-12 text-base placeholder:text-[#9ca3af] focus-visible:border-[#bdbdbd] focus-visible:ring-[3px] focus-visible:ring-brand/12 md:text-sm",
                fieldState.invalid &&
                  "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
              )}
            />
          </div>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
