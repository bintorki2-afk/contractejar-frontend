import Image from "next/image";

import AnimatedStat from "@/features/services/components/animated-stat";
import ServicesVisual from "@/features/services/components/services-visual";

type ServiceRequirement = {
  key: string;
  label: string;
  icon: "people" | "deed" | "home" | "money" | "chat";
};

type ServiceVisualContent = {
  navActive: string;
  heading: string;
  subheading: string;
  hint: string;
  steps: string[];
  activeStep: number;
  requirements: ServiceRequirement[];
  priceBoxLabel: string;
  startLabel: string;
  seeAllLabel: string;
  priceValue: string;
  priceCurrency: string;
  priceLabel: string;
  priceSub: string;
  verifiedLabel: string;
};

type ServicesShowcaseCardProps = {
  imageSrc: string;
  imageAlt: string;
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  statsValue: string;
  statsText: string;
  /** When provided, a live CSS visual is rendered instead of the flat image. */
  visual?: ServiceVisualContent;
  reverse?: boolean;
};

export default function ServicesShowcaseCard({
  imageSrc,
  imageAlt,
  eyebrow,
  titleLine1,
  titleLine2,
  description,
  statsValue,
  statsText,
  visual,
  reverse = false,
}: ServicesShowcaseCardProps) {
  return (
    <article
      className={`grid items-center gap-8 lg:grid-cols-2 ${
        reverse ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div className="mx-auto flex max-w-md flex-col items-start gap-4 text-start">
        <p className="text-xs font-semibold text-brand-secondary">{eyebrow}</p>
        <h3 className="text-5xl font-bold leading-tight text-brand">
          <span className="block">{titleLine1}</span>
          <span className="block">{titleLine2}</span>
        </h3>
        <p className="leading-7 text-black dark:text-white/90">{description}</p>

        <AnimatedStat value={statsValue} text={statsText} />
      </div>

      {visual ? (
        <ServicesVisual alt={imageAlt} {...visual} />
      ) : (
        <div className="group overflow-hidden rounded-3xl">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={1024}
            height={1024}
            className="h-auto w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 1023px) 100vw, 50vw"
            quality={75}
          />
        </div>
      )}
    </article>
  );
}
