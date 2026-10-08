"use client";

import { ArrowLeftRight, ChevronLeft } from "lucide-react";
import IntentLink from "@/components/navigation/intent-link";

import HeroCtaButton from "@/features/home/components/hero-cta-button";
import { resetCreateContractDraft } from "@/features/create-contract/utils/reset-create-contract-draft";

type HeroCtaButtonsProps = {
  residentialCta: string;
  commercialCta: string;
  mostRequested: string;
  lessorChangeCta: string;
  lessorChangeHint: string;
};

export default function HeroCtaButtons({
  residentialCta,
  commercialCta,
  mostRequested,
  lessorChangeCta,
  lessorChangeHint,
}: HeroCtaButtonsProps) {
  return (
    <div className="flex flex-col gap-3">
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:gap-4">
      <div className="flex w-full flex-col items-center gap-2 sm:min-w-0 sm:flex-1">
        <IntentLink
          href="/create-contract?id=residential"
          className="w-full"
          onClick={resetCreateContractDraft}
        >
          <HeroCtaButton
            label={residentialCta}
            iconSrc="/icons/housing.svg"
            featured
          />
        </IntentLink>
        <p className="flex items-center justify-center gap-1.5 text-sm font-bold text-brand">
          <span aria-hidden="true">🔥</span>
          {mostRequested}
          <span aria-hidden="true">✨</span>
        </p>
      </div>

      <div className="w-full sm:min-w-0 sm:flex-1">
        <IntentLink
          href="/create-contract?id=commercial"
          className="w-full"
          onClick={resetCreateContractDraft}
        >
          <HeroCtaButton
            label={commercialCta}
            iconSrc="/icons/commercial.svg"
          />
        </IntentLink>
      </div>
    </div>

      {/* Third service: «تغيير المؤجر» — a quiet secondary link under the two
          contract CTAs. */}
      <IntentLink
        href="/service/lessor-change"
        className="group inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-brand/15 bg-white/70 py-2 pe-4 ps-2 text-sm font-bold text-brand transition-colors hover:border-brand/40 hover:bg-white dark:border-[#2f403b] dark:bg-white/5 dark:hover:bg-white/10"
      >
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-background-green text-brand dark:bg-[#16352f] dark:text-[#48c0b8]">
          <ArrowLeftRight className="size-3.5" aria-hidden="true" />
        </span>
        <span className="truncate">{lessorChangeCta}</span>
        <span className="hidden truncate text-xs font-medium text-[#6f6f6f] sm:inline dark:text-white/60">
          — {lessorChangeHint}
        </span>
        <ChevronLeft
          className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5 rtl:rotate-0 ltr:rotate-180"
          aria-hidden="true"
        />
      </IntentLink>
    </div>
  );
}
