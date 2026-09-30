"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type CreateContractFieldLabelProps = {
  label: string;
  invalid?: boolean;
  required?: boolean;
  /** Optional rich explanation shown in a popover when the info icon is used. */
  help?: ReactNode;
};

export default function CreateContractFieldLabel({
  label,
  invalid = false,
  required = true,
  help,
}: CreateContractFieldLabelProps) {
  return (
    <div className="mb-1 flex items-center gap-1.5">
      <label
        className={cn(
          "text-sm font-semibold",
          invalid ? "text-[#c62828]" : "text-black dark:text-white",
        )}
      >
        {label}
      </label>
      {required ? <span className="text-red-500">*</span> : null}

      {help ? (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="شرح هذا الحقل"
              className="inline-flex size-5 items-center justify-center rounded-full bg-brand/10 text-brand transition hover:bg-brand/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <Info className="size-3.5" aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[320px] overflow-hidden p-0"
          >
            {help}
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  );
}
