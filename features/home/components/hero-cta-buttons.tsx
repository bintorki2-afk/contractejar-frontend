"use client";

import HeroCtaButton from "@/features/home/components/hero-cta-button";
import { resetCreateContractDraft } from "@/features/create-contract/utils/reset-create-contract-draft";
import Link from "next/link";

type HeroCtaButtonsProps = {
  residentialCta: string;
  commercialCta: string;
  mostRequested: string;
};

export default function HeroCtaButtons({
  residentialCta,
  commercialCta,
  mostRequested,
}: HeroCtaButtonsProps) {
  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:gap-4">
      <div className="flex w-full flex-col items-center gap-2 sm:min-w-0 sm:flex-1">
        <Link
          href="/create-contract?id=residential"
          className="w-full"
          onClick={resetCreateContractDraft}
        >
          <HeroCtaButton
            label={residentialCta}
            iconSrc="/icons/housing.svg"
            featured
          />
        </Link>
        <p className="flex items-center justify-center gap-1.5 text-sm font-bold text-brand">
          <span aria-hidden="true">🔥</span>
          {mostRequested}
          <span aria-hidden="true">✨</span>
        </p>
      </div>

      <div className="w-full sm:min-w-0 sm:flex-1">
        <Link
          href="/create-contract?id=commercial"
          className="w-full"
          onClick={resetCreateContractDraft}
        >
          <HeroCtaButton
            label={commercialCta}
            iconSrc="/icons/commercial.svg"
          />
        </Link>
      </div>
    </div>
  );
}
