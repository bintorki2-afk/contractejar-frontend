import AboutBeneficiaryCard from "@/features/about/components/about-beneficiary-card";
import type { AboutBeneficiariesResolved } from "@/features/about/types/about-content";

type AboutBeneficiariesSectionProps = {
  content: AboutBeneficiariesResolved;
};

export default function AboutBeneficiariesSection({
  content,
}: AboutBeneficiariesSectionProps) {
  return (
    <section className="bg-brand/10 py-16 md:py-20">
      <div className="container space-y-10 md:space-y-12">
        <header className="mx-auto  space-y-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-brand-background-green px-4 py-1.5 text-sm font-bold text-foreground">
            {content.badge}
          </span>
          <h2 className="text-4xl font-extrabold leading-tight text-brand md:text-5xl">
            {content.title}
          </h2>
          <p className="text-sm leading-8 text-black dark:text-white/90 md:text-base">
            {content.description}
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {content.cards.map((item) => (
            <AboutBeneficiaryCard
              key={item.id}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
