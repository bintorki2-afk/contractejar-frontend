import Image from "next/image";

import HeroCtaButtons from "@/features/home/components/hero-cta-buttons";
import ReviewsHeroStrip from "@/features/reviews/components/reviews-hero-strip";
import CustomIcon from "@/features/shared/components/custom-icon";

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
};

export default function HeroContent({
  badge,
  titleLine1Accent,
  titleLine1Main,
  titleLine2Main,
  titleLine2Accent,
  description,
  features: _features,
  residentialCta,
  commercialCta,
  mostRequested,
}: HeroContentProps) {
  return (
    <div className="order-2 flex min-w-0 flex-1 flex-col gap-6 py-4 lg:order-2 lg:py-8">
      <div className="flex w-fit max-w-full flex-wrap items-center gap-2.5 rounded-full border border-black/[0.06] bg-white/60 p-2 text-sm font-semibold text-[#005848] shadow-sm backdrop-blur-sm dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.30),0_8px_22px_rgba(0,0,0,0.18)]">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand">
          <CustomIcon src="/icons/file.svg" size={18} className="text-white" />
        </span>
        <span>{badge}</span>
        <span className="relative flex h-8 shrink-0 items-center overflow-hidden rounded-full bg-linear-to-b from-white to-[#eef3f1] px-3 shadow-[0_2px_8px_rgba(0,0,0,0.18),0_0_12px_rgba(127,227,194,0.35)] ring-1 ring-black/5 dark:ring-[#7fe3c2]/40">
          <Image
            src="/images/ejar.png"
            alt="منصة إيجار"
            width={72}
            height={30}
            className="h-4 w-auto object-contain"
          />
          <span
            className="animate-shine pointer-events-none absolute inset-y-0 left-0 h-full w-2/5 bg-linear-to-r from-transparent via-white/90 to-transparent"
            style={{ animationDuration: "3s" }}
            aria-hidden="true"
          />
        </span>
      </div>

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
            <span className="block">
              {titleLine2Main ? (
                <span className="text-foreground">{titleLine2Main}</span>
              ) : null}
              {titleLine2Main && titleLine2Accent ? " " : null}
              {titleLine2Accent ? (
                <span className="text-brand-secondary">{titleLine2Accent}</span>
              ) : null}
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
      />

      <ReviewsHeroStrip />
    </div>
  );
}
