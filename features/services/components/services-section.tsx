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
                      heading: "إنشاء عقد إيجار سكني",
                      tabs: ["عقد إيجار", "الصك", "المالك", "المستأجر"],
                      rowTitle: "دفع المقابل المالي للعقد",
                      rowSubtitle: "تفاصيل المقابل المالي للعقد",
                      successTitle: "تم إنشاء عقد إيجار سكني بنجاح",
                      successSubtitle: "تهانينا، تم الدفع بنجاح",
                      priceValue: "٢٤٩",
                      priceCurrency: "ريال",
                      priceLabel: "إنشاء عقد إيجار سكني",
                      priceSub: "عمارة، شقة، فيلا، غرفة",
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
