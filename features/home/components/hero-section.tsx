import HeroContent from "@/features/home/components/hero-content";
import HeroVisual from "@/features/home/components/hero-visual";
import HeroWhatsappButton from "@/features/home/components/hero-whatsapp-button";
import type { HomeHeroResolved } from "@/features/home/types/home-content";

type HeroSectionProps = {
  content: HomeHeroResolved;
};

export default function HeroSection({ content }: HeroSectionProps) {
  return (
    <section className="relative min-h-screend rounded-3xl bg-brand-background-green pb-2   lg:rounded-[60px] 2xl:rounded-[80px] rounded-t-none! overflow-hidden">

      {/* Ambient aurora glow — subtle life behind the hero. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 -start-24 size-[38rem] rounded-full bg-brand-secondary/20 blur-3xl animate-aurora" />
        <div className="absolute -bottom-32 -end-24 size-[42rem] rounded-full bg-brand/25 blur-3xl animate-aurora-slow" />
      </div>

      <div className="relative container pb-10 ">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
          <div className="min-w-0 flex-1">
            <HeroContent
              badge={content.badge}
              titleLine1Accent={content.titleLine1Accent}
              titleLine1Main={content.titleLine1Main}
              titleLine2Main={content.titleLine2Main}
              titleLine2Accent={content.titleLine2Accent}
              description={content.description}
              features={content.features}
              residentialCta={content.residentialCta}
              commercialCta={content.commercialCta}
              mostRequested={content.mostRequested}
            />
          </div>

          <div className="w-full shrink-0 lg:w-[50%] max-lg:hidden">
            <HeroVisual alt={content.visualAlt} imageUrl={content.imageUrl} />
          </div>
        </div>

        <HeroWhatsappButton
          label={content.whatsappLabel}
          href={content.whatsappHref}
        />
      </div>
    </section>
  );
}
