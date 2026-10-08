"use client";

import { Lock } from "lucide-react";

type CreateContractPaymentHeroProps = {
  securePaymentLabel: string;
};

/**
 * Payment-step header: only the secure-payment pill. The journey tagline lives
 * in the stepper banner, and the review happens on the step before payment.
 */
export default function CreateContractPaymentHero({
  securePaymentLabel,
}: CreateContractPaymentHeroProps) {
  return (
    <div className="flex h-12 items-center justify-center gap-2 rounded-full bg-brand-background-green px-4">
      <span className="text-sm font-bold text-brand">{securePaymentLabel}</span>
      <Lock className="size-4 shrink-0 text-[#e39b2d]" aria-hidden="true" />
    </div>
  );
}
