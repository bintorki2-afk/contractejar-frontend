import AboutCoreValueItem from "@/features/about/components/about-core-value-item";
import type { AboutCoreValuesResolved } from "@/features/about/types/about-content";

type AboutCoreValuesSectionProps = {
  content: AboutCoreValuesResolved;
};

export default function AboutCoreValuesSection({
  content,
}: AboutCoreValuesSectionProps) {
  return (
    <section className="bg-white dark:bg-[#151c1b] py-16 md:py-20">
      <div className="container space-y-12 md:space-y-16">
        <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-12">
          <div className="shrink-0 space-y-4">
            <span className="inline-flex items-center rounded-full border bg-brand-background-green px-4 py-1.5 text-sm font-bold text-foreground">
              {content.badge}
            </span>
            <h2 className="text-4xl font-extrabold leading-tight text-brand md:text-5xl">
              {content.title}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-8 text-foreground/70 md:pt-10 md:text-base">
            {content.description}
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-gray-300/10">
          {content.cards.map((item) => (
            <AboutCoreValueItem
              key={item.id}
              icon={item.icon}
              eyebrow={item.eyebrow}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
