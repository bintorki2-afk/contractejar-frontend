import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import SupportVisual from "@/features/support/components/support-visual";
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
    <section className="bg-brand dark:bg-transparent py-16 md:py-24">
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
            <SupportVisual
              alt={resolved.imageAlt}
              chatName="فريق دعم عقد إيجار"
              status="متصل الآن"
              messages={[
                {
                  from: "in",
                  text: "أهلاً بك في عقد إيجار 👋 كيف يمكنني مساعدتك في توثيق عقدك؟",
                  time: "١:٣٠ ص",
                },
                {
                  from: "out",
                  text: "أبغى أوثّق عقد إيجار سكني، كم يأخذ وقت؟",
                  time: "١:٣١ ص",
                },
                {
                  from: "in",
                  text: "يتم التوثيق خلال ٣٠ دقيقة فقط! أرسل بياناتك وأبدأ فوراً 🚀",
                  time: "١:٣٢ ص",
                },
              ]}
              inputPlaceholder="اكتب رسالتك…"
              satisfaction={resolved.satisfaction}
              responseTime={resolved.responseTime}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
