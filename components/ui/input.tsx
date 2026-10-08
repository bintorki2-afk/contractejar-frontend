import * as React from "react"

import { isNumericInput, normalizeMobileInput, toAsciiDigits } from "@/lib/utils/digits"
import { cn } from "@/lib/utils"

function Input({ className, type, onChange, ...props }: React.ComponentProps<"input">) {
  const normalizeDigits = isNumericInput({ inputMode: props.inputMode, type })

  // Every numeric/tel input accepts Arabic-Indic digits (٠-٩ / ۰-۹) and
  // converts them to ASCII as the user types, so validators and the backend
  // always see plain digits regardless of the keyboard language.
  const handleChange = normalizeDigits
    ? (event: React.ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value
        const normalized =
          type === "tel" || props.inputMode === "tel"
            ? normalizeMobileInput(raw)
            : toAsciiDigits(raw)

        if (normalized !== raw) {
          event.target.value = normalized
        }

        onChange?.(event)
      }
    : onChange

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      onChange={handleChange}
      {...props}
    />
  )
}

export { Input }
