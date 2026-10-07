import HeroContent from "@/features/home/components/hero-content";
import HeroVisual from "@/features/home/components/hero-visual";
import HeroWhatsappButton from "@/features/home/components/hero-whatsapp-button";
import type { HomeHeroResolved } from "@/features/home/types/home-content";

type HeroSectionProps = {
  content: HomeHeroResolved;
};

export default function HeroSection({ content }: HeroSectionProps) {
  return (
    <section
      // Pull the green hero up behind the transparent fixed header, and pad the
      // content back down by the same amount — so the header pill floats on the
      // hero's green at the top with no dead dark band, and content never shifts.
      style={{
        marginTop: "calc(-1 * var(--header-h, 148px))",
        paddingTop: "var(--header-h, 148px)",
      }}
      className="relative rounded-3xl bg-brand-background-green pb-2 lg:rounded-[60px] 2xl:rounded-[80px] rounded-t-none! overflow-hidden"
    >

      <div className="relative container pb-10 ">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-8">
          {/* Phones see the phone mockup first, then the title + CTAs; on
              desktop the visual sits beside the copy. */}
          <div className="order-first w-full shrink-0 lg:order-last lg:w-[50%]">
            <HeroVisual alt={content.visualAlt} imageUrl={content.imageUrl} />
          </div>

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
              lessorChangeCta={content.lessorChangeCta}
              lessorChangeHint={content.lessorChangeHint}
            />
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
