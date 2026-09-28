import { ArrowLeft, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import type { HomeContactResolved } from "@/features/home/types/home-content";
import { getWhatsappHref } from "@/features/settings/services/get-whatsapp-href";

type SupportSectionProps = {
  content?: HomeContactResolved;
};

export default async function SupportSection({ content }: SupportSectionProps) {
  const resolved =
    content ??
    (await (async () => {
      const [t, whatsappHref] = await Promise.all([
        getTranslations("support"),
        getWhatsappHref(),
      ]);
      return {
        eyebrow: t("eyebrow"),
        title: [t("titleLine1"), t("titleLine2"), t("titleLine3")]
          .filter(Boolean)
          .join(" "),
        description: t("description"),
        cta: t("cta"),
        satisfaction: t("satisfaction"),
        responseTime: t("responseTime"),
        imageAlt: t("imageAlt"),
        imageUrl: "/images/support-banner.png",
        whatsappHref,
      } satisfies HomeContactResolved;
    })());

  return (
    <section className="bg-brand dark:bg-gradient-to-br dark:from-[#153a30] dark:to-[#0d241f] py-16 md:py-24">
      <div className="container">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="order-2 space-y-5 text-center text-white lg:order-1 lg:text-start">
            <p className="text-sm font-medium text-white/90">{resolved.eyebrow}</p>
            <h2 className="text-4xl font-extrabold leading-tight md:text-5xl">
              {resolved.title}
            </h2>
            <p className="mx-auto max-w-lg text-sm leading-7 text-white lg:mx-0">
              {resolved.description}
            </p>

            <div className="pt-1">
              <Link
                href={resolved.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-2 py-2  text-sm font-bold text-brand dark:!text-[#005848] transition hover:bg-white/95"
              >
                <span>{resolved.cta}</span>
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-secondary text-white">
                  <ArrowLeft
                    className="size-4 rotate-45 transition-transform duration-300 group-hover:rotate-0"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative overflow-hidden ">
              <Image
                src={resolved.imageUrl}
                alt={resolved.imageAlt}
                width={920}
                height={648}
                className="h-auto w-full rounded-[2.2rem] object-cover"
                sizes="(max-width: 1023px) 100vw, 50vw"
                quality={75}
                unoptimized={
                  resolved.imageUrl.startsWith("http://") ||
                  resolved.imageUrl.startsWith("https://")
                }
              />

              <span className="absolute inset-s-6 top-8 inline-flex -rotate-12 items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-extrabold text-white shadow-lg">
                {resolved.satisfaction}
              </span>

              <span className="absolute bottom-10 inset-e-6 inline-flex rotate-12 items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-extrabold text-white shadow-lg">
                <MessageCircle className="size-4" aria-hidden="true" />
                {resolved.responseTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
