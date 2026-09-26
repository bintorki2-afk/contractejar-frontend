import { ArrowLeft, Mail } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FooterNewsletterProps = {
  placeholder: string;
  submitLabel: string;
};

export default function FooterNewsletter({
  placeholder,
  submitLabel,
}: FooterNewsletterProps) {
  return (
    <form className="relative w-full">
      <Input
        type="email"
        placeholder={placeholder}
        className={cn(
          "h-12 rounded-xl border-[#e5e5e5] dark:border-[#262d2c] bg-brand-background pe-14 ps-10 text-sm",
          "placeholder:text-[#9ca3af] focus-visible:border-brand/30 focus-visible:ring-brand/10"
        )}
      />
      <Mail
        className="pointer-events-none absolute inset-s-4 top-1/2 size-4 -translate-y-1/2 text-black dark:text-white/90"
        aria-hidden="true"
      />
      <button
        type="submit"
        className="absolute inset-e-1.5 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg bg-brand-secondary text-white transition-colors hover:bg-brand"
        aria-label={submitLabel}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
      </button>
    </form>
  );
}
