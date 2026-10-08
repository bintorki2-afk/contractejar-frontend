import { cn } from "@/lib/utils";

export type FieldChromeState = "default" | "invalid" | "valid";

export function resolveFieldChromeState(options: {
  invalid?: boolean;
  valid?: boolean;
}): FieldChromeState {
  if (options.invalid) {
    return "invalid";
  }

  if (options.valid) {
    return "valid";
  }

  return "default";
}

export function fieldChromeSurfaceClass(
  state: FieldChromeState,
  options?: {
    defaultBgClassName?: string;
  },
) {
  const defaultBg =
    options?.defaultBgClassName ?? "bg-[#FBFBFA] dark:bg-[#0d1614]";

  return cn(
    state === "invalid" && "border-[#e57373] dark:border-[#e57373]",
    state === "valid" &&
      "border-brand bg-brand-background-green dark:border-brand-secondary dark:bg-[#16352f]",
    state === "default" && cn("border-[#e8e8e8] dark:border-[#2f403b]", defaultBg),
    state === "invalid" && defaultBg,
  );
}

/**
 * Nested Input inside a chrome wrapper — keep a11y invalid, kill extra border/ring.
 * `self-stretch` makes the (borderless) input fill the wrapper's full height so
 * the whole visible box is the tap target (the input alone was ~31px tall).
 */
export const fieldChromeNestedInputClass =
  "self-stretch border-0 bg-transparent shadow-none text-black dark:text-white placeholder:text-[#bdbdbd] dark:placeholder:text-[#6b7d78] focus-visible:border-0 focus-visible:ring-0 aria-invalid:border-0 aria-invalid:ring-0 dark:aria-invalid:border-0 dark:aria-invalid:ring-0";

/** Input/textarea that is itself the chrome surface — one border only. */
export const fieldChromeControlClass =
  "shadow-none text-black dark:text-white placeholder:text-[#bdbdbd] dark:placeholder:text-[#6b7d78] focus-visible:ring-0 aria-invalid:border-[#e57373] aria-invalid:ring-0 dark:aria-invalid:border-[#e57373] dark:aria-invalid:ring-0 dark:bg-[#0d1614]";

export function fieldChromeIconClass(state: FieldChromeState) {
  if (state === "invalid") {
    return "text-[#c62828]";
  }

  if (state === "valid") {
    return "text-brand";
  }

  return "text-brand-secondary";
}
