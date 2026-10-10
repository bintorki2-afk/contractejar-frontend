"use client";

import { ArrowLeft, Check } from "lucide-react";

import CustomIcon from "@/features/shared/components/custom-icon";
import { resetCreateContractDraft } from "@/features/create-contract/utils/reset-create-contract-draft";
import Image from "next/image";
import Link from "next/link";

/**
 * Government / platform mark shown beside a feature, matched on the feature
 * text so the copy (static or from the dashboard) can be reordered freely.
 * Features with no matching entity (e.g. «بلدي», no asset yet) show no logo.
 */
const FEATURE_LOGO_RULES: { match: RegExp; src: string; alt: string }[] = [
  { match: /حساب المواطن|citizen/i, src: "/images/hesab.png", alt: "حساب المواطن" },
  { match: /ضمان|daman|developer guarantee/i, src: "/images/daman.png", alt: "الضمان المطوّر" },
  { match: /سند تنفيذي|ناجز|najiz|enforceable/i, src: "/images/najez.png", alt: "ناجز" },
  { match: /وزارة التجارة|التجارة|commerce/i, src: "/images/tegara.png", alt: "وزارة التجارة" },
  {
    match: /المركز السعودي|saudi business center|business center/i,
    src: "/images/saudi-center.png",
    alt: "المركز السعودي للأعمال",
  },
  { match: /إيجار|ايجار|عقدك|ejar|contract/i, src: "/images/ejar.png", alt: "منصة إيجار" },
];

function resolveFeatureLogo(feature: string) {
  return FEATURE_LOGO_RULES.find((rule) => rule.match.test(feature)) ?? null;
}

type PricingCardProps = {
  id: string;
  icon: string;
  title: string;
  description: string;
  price: string;
  period: string;
  benefitsTitle: string;
  features: string[];
  cta: string;
};

export default function PricingCard({
  id,
  icon,
  title,
  description,
  price,
  period,
  benefitsTitle,
  features,
  cta,
}: PricingCardProps) {
  return (
    <article className="rounded-[3rem] border bg-brand-background shadow-md p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
      <div className="mb-6 flex flex-col items-strat ">
        <span className="mb-4 inline-flex size-9 items-center justify-start rounded-full text-brand shrink-0">
          <CustomIcon src={icon} size={30} className="text-brand" />
        </span>
        <h3 className="text-2xl font-extrabold leading-tight text-brand">
          {title}
        </h3>
        <p className="mt-1 text-xs text-[#7f7f7f] dark:text-white/50">{description}</p>
      </div>

      <div className="mb-6 border-t border-[#e2e2e2] dark:border-[#262d2c] pt-5">
        <div className="flex items-end  gap-1.5 text-brand">
          <span className="text-[2.8rem] font-extrabold leading-none">
            {price}
            <CustomIcon
              src="/icons/ryal.svg"
              size={30}
              className="text-brand"
            />
          </span>
          <span className="pb-1 text-sm text-muted-foreground">{period}</span>
        </div>
      </div>

      <div className="mb-5 rounded-[1.55rem] bg-white dark:bg-[#151c1b] p-6">
        <p className="mb-3  text-base font-bold text-black dark:text-white/90">{benefitsTitle}</p>
        <ul className="space-y-3">
          {features.map((feature, index) => {
            const logo = resolveFeatureLogo(feature);

            return (
              <li
                key={`${feature}-${index}`}
                className="flex min-h-9 items-center gap-2"
              >
                <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-brand-secondary text-white">
                  <Check className="size-3" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-black sm:text-base dark:text-white/90">
                  {feature}
                </span>
                {logo ? (
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    title={logo.alt}
                    width={160}
                    height={56}
                    sizes="120px"
                    className="h-8 w-auto max-w-28 shrink-0 object-contain object-left sm:h-9"
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
      <Link
        href={`/create-contract?id=${id}`}
        onClick={resetCreateContractDraft}
      >
        {/* QA WEB-16: the link's visual body, not a nested <button>. */}
        <span className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-extrabold text-white transition hover:bg-brand/90">
          <span>{cta}</span>
          <ArrowLeft
            className="size-4 transition-transform duration-300 group-hover:rotate-45"
            aria-hidden="true"
          />
        </span>
      </Link>
    </article>
  );
}
