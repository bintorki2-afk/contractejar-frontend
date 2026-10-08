
import Image from "next/image";

import HeroCtaButtons from "@/features/home/components/hero-cta-buttons";
import HeroMarquee from "@/features/home/components/hero-marquee";
import ReviewsHeroStrip from "@/features/reviews/components/reviews-hero-strip";

type HeroContentProps = {
  badge: string;
  titleLine1Accent: string;
  titleLine1Main: string;
  titleLine2Main: string;
  titleLine2Accent: string;
  description: string;
  features: string[];
  residentialCta: string;
  commercialCta: string;
  mostRequested: string;
  lessorChangeCta: string;
  lessorChangeHint: string;
};

export default function HeroContent({
  titleLine1Accent,
  titleLine1Main,
  titleLine2Main,
  titleLine2Accent,
  description,
  features: _features,
  residentialCta,
  commercialCta,
  mostRequested,
  lessorChangeCta,
  lessorChangeHint,
}: HeroContentProps) {
  return (
    <div className="order-2 flex min-w-0 flex-1 flex-col gap-6 py-4 lg:order-2 lg:py-8">
      <div className="space-y-4">
        <h1 className="max-w-xl space-y-2 text-3xl font-bold sm:text-4xl lg:text-[2.5rem] lg:leading-[1.15] 2xl:text-[3.5rem]">
          <span className="block">
            {titleLine1Accent ? (
              <span className="text-brand-secondary">{titleLine1Accent}</span>
            ) : null}
            {titleLine1Accent && titleLine1Main ? " " : null}
            {titleLine1Main ? (
              <span className="text-foreground">{titleLine1Main}</span>
            ) : null}
          </span>
          {(titleLine2Main || titleLine2Accent) && (
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>
                {titleLine2Main ? (
                  <span className="text-foreground">{titleLine2Main}</span>
                ) : null}
                {titleLine2Main && titleLine2Accent ? " " : null}
                {titleLine2Accent ? (
                  <span className="text-brand-secondary">{titleLine2Accent}</span>
                ) : null}
              </span>
              {/* Ejar mark beside the title: the contract is documented on Ejar. */}
              <Image
                src="/images/ejar.png"
                alt="منصة إيجار"
                width={88}
                height={32}
                className="inline-block h-7 w-auto shrink-0 object-contain align-middle sm:h-8 lg:h-9 dark:brightness-125"
              />
            </span>
          )}
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-black dark:text-white/90">
          {description}
        </p>
      </div>

      <HeroCtaButtons
        residentialCta={residentialCta}
        commercialCta={commercialCta}
        mostRequested={mostRequested}
        lessorChangeCta={lessorChangeCta}
        lessorChangeHint={lessorChangeHint}
      />

      <ReviewsHeroStrip />

      <HeroMarquee />
    </div>
  );
}
