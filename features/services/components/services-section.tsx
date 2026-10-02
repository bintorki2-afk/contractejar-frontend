import { getTranslations } from "next-intl/server";

import ServicesShowcaseCard from "@/features/services/components/services-showcase-card";
import { serviceLayoutOrder } from "@/features/services/data/service-layout-order";
import type {
  ServiceItemTranslations,
  ServiceType,
} from "@/features/services/types/service";

export default async function ServicesSection() {
  const t = await getTranslations("services");
  const items = t.raw("items") as Record<ServiceType, ServiceItemTranslations>;

  return (
    <section className="py-16 md:py-20">
      <div className="container space-y-10 md:space-y-14">
        <header className="mx-auto max-w-3xl space-y-3 text-center">
          <h2 className="text-4xl font-bold text-foreground md:text-5xl">
            {t("title")}
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            {t("description")}
          </p>
        </header>

        {serviceLayoutOrder.map((serviceType, index) => {
          const item = items[serviceType];

          return (
            <ServicesShowcaseCard
              key={serviceType}
              imageSrc={`/images/services-${index + 1}.png`}
              imageAlt={item.titleLine1}
              eyebrow={item.eyebrow}
              titleLine1={item.titleLine1}
              titleLine2={item.titleLine2}
              description={item.description}
              statsValue={item.statsValue}
              statsText={item.statsText}
              visual={
                serviceType === "residential"
                  ? {
                      navActive: "عقد سكني",
                      heading: "طلبات قبل أن نبدأ",
                      subheading: "لخدمتك بشكل سريع، جهّز التالي:",
                      hint: "رحلتك الإيجارية أصبحت أسهل.",
                      steps: ["الصك", "المالك", "المستأجر", "المالية"],
                      activeStep: 0,
                      requirements: [
                        { key: "parties", label: "بيانات المؤجر والمستأجر.", icon: "people" },
                        { key: "deed", label: "صورة الصك وعنوان العقار.", icon: "deed" },
                        { key: "unit", label: "بيانات الوحدة المؤجرة.", icon: "home" },
                        { key: "rent", label: "مبلغ الإيجار.", icon: "money" },
                        { key: "draft", label: "نرسل لك مسودة العقد عبر واتساب للاطلاع.", icon: "chat" },
                      ],
                      priceBoxLabel: "سعر العقد لمدة سنة :",
                      startLabel: "لنبدأ",
                      seeAllLabel: "عرض جميع الأسعار",
                      priceValue: "٢٤٩",
                      priceCurrency: "ريال",
                      priceLabel: "إنشاء عقد إيجار سكني",
                      priceSub: "عمارة، شقة، فيلا، غرفة",
                      verifiedLabel: "موثّق رسميًا",
                    }
                  : serviceType === "commercial"
                    ? {
                        navActive: "عقد تجاري",
                        heading: "طلبات قبل أن نبدأ",
                        subheading: "لخدمتك بشكل سريع، جهّز التالي:",
                        hint: "رحلتك الإيجارية أصبحت أسهل.",
                        steps: ["الصك", "المالك", "المستأجر", "المالية"],
                        activeStep: 0,
                        requirements: [
                          { key: "parties", label: "بيانات المؤجر والمستأجر.", icon: "people" },
                          { key: "deed", label: "صورة الصك والسجل التجاري.", icon: "deed" },
                          { key: "unit", label: "بيانات الوحدة التجارية.", icon: "home" },
                          { key: "rent", label: "مبلغ الإيجار.", icon: "money" },
                          { key: "draft", label: "نرسل لك مسودة العقد عبر واتساب للاطلاع.", icon: "chat" },
                        ],
                        priceBoxLabel: "سعر العقد لمدة سنة :",
                        startLabel: "لنبدأ",
                        seeAllLabel: "عرض جميع الأسعار",
                        priceValue: "٣٤٩",
                        priceCurrency: "ريال",
                        priceLabel: "إنشاء عقد إيجار تجاري",
                        priceSub: "محلات، مكاتب، معارض",
                        verifiedLabel: "موثّق رسميًا",
                      }
                    : undefined
              }
              reverse={serviceType === "commercial"}
            />
          );
        })}
      </div>
    </section>
  );
}
