"use client";

import { ChevronDown } from "lucide-react";
import { useRef, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import CreatePropertyFieldLabel from "@/features/create-property/components/create-property-field-label";
import {
  fieldChromeSurfaceClass,
  resolveFieldChromeState,
} from "@/lib/ui/field-chrome";
import { cn } from "@/lib/utils";

type CreatePropertyFormSelectProps = {
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hideLabel?: boolean;
  variant?: "default" | "compact";
  invalid?: boolean;
  valid?: boolean;
};

export default function CreatePropertyFormSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  required = true,
  hideLabel = false,
  variant = "default",
  invalid = false,
  valid = false,
}: CreatePropertyFormSelectProps) {
  const [open, setOpen] = useState(false);
  const [contentWidth, setContentWidth] = useState<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((option) => option.value === value)?.label;
  const isCompact = variant === "compact";
  const chrome = resolveFieldChromeState({ invalid, valid });

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && containerRef.current) {
      setContentWidth(containerRef.current.offsetWidth);
    }

    setOpen(nextOpen);
  }

  function openSelect() {
    if (containerRef.current) {
      setContentWidth(containerRef.current.offsetWidth);
    }

    setOpen(true);
  }

  return (
    <div className="min-w-0">
      {!hideLabel ? (
        required ? (
          <CreatePropertyFieldLabel label={label} invalid={invalid} />
        ) : (
          <label
            className={cn(
              "mb-2 block text-sm font-semibold",
              invalid ? "text-[#c62828]" : "text-black dark:text-white",
            )}
          >
            {label}
          </label>
        )
      ) : null}

      <div
        ref={containerRef}
        className={cn(
          "flex w-full items-center gap-2 rounded-2xl border px-3",
          fieldChromeSurfaceClass(chrome),
          isCompact ? "h-9" : "h-10",
        )}
      >
        <div
          className="flex min-w-0 flex-1 cursor-pointer items-center self-stretch"
          onClick={openSelect}
        >
          {value ? (
            <span
              className={cn(
                "truncate font-semibold text-[#333333] dark:text-white",
                isCompact ? "text-xs sm:text-sm" : "text-sm",
              )}
            >
              {selectedLabel}
            </span>
          ) : (
            <button
              type="button"
              aria-label={label}
              className={cn(
                "w-full text-start text-[#bdbdbd] dark:text-[#6b7d78]",
                isCompact ? "text-xs sm:text-sm" : "text-sm",
              )}
              onClick={openSelect}
            >
              {placeholder}
            </button>
          )}
        </div>

        <Select
          open={open}
          onOpenChange={handleOpenChange}
          value={value || undefined}
          onValueChange={(nextValue) => {
            onChange(nextValue);
            setOpen(false);
          }}
        >
          <SelectTrigger
            aria-label={label}
            className="inline-flex size-7! shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0! text-[#333333] shadow-none focus-visible:ring-0 dark:text-white [&>svg:last-child]:hidden"
          >
            <ChevronDown className="size-4 text-[#333333] dark:text-white" aria-hidden="true" />
          </SelectTrigger>

          <SelectContent
            position="popper"
            align="end"
            side="bottom"
            sideOffset={6}
            // Let the list flip above the field when there is no room below: a
            // fixed-position list that opens off-screen is unreachable (body scroll locks).
            className="max-h-[min(20rem,var(--radix-select-content-available-height))] rounded-2xl border border-[#e8e8e8] bg-white text-[#1a1a1a] dark:border-[#2f403b] dark:bg-[#1a2421] dark:text-white"
            style={{
              width: contentWidth,
              minWidth: contentWidth,
            }}
          >
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-base! focus:bg-[#f0f0f0] focus:text-[#1a1a1a] dark:focus:bg-[#16352f] dark:focus:text-white"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
