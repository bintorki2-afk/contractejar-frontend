import { Building2, FolderOpen, Zap } from "lucide-react";
import type { ComponentType } from "react";

import type { MyPropertiesHowItWorksStep } from "@/features/my-properties/types/my-properties-labels";

type MyPropertiesHowItWorksProps = {
  title: string;
  subtitle: string;
  steps: MyPropertiesHowItWorksStep[];
};

const STEP_ICONS: ComponentType<{ className?: string }>[] = [
  Building2,
  Zap,
  FolderOpen,
];

/**
 * Explains the value of "عقاراتي" to the customer: save once, reuse for
 * contracts, keep everything organized. Rendered as a set of numbered cards
 * that match the site's brand styling.
 */
export default function MyPropertiesHowItWorks({
  title,
  subtitle,
  steps,
}: MyPropertiesHowItWorksProps) {
  if (!steps?.length) {
    return null;
  }

  return (
    <section className="mt-8 sm:mt-10">
      <div className="mb-5 space-y-2 text-center sm:mb-7">
        <h2 className="text-xl font-extrabold text-brand sm:text-2xl">
          {title}
        </h2>
        <p className="mx-auto max-w-2xl text-sm leading-7 text-[#7a7a7a] sm:text-base">
          {subtitle}
        </p>
      </div>

      <ol className="grid gap-4 sm:grid-cols-3 sm:gap-5">
        {steps.map((step, index) => {
          const Icon = STEP_ICONS[index] ?? Building2;

          return (
            <li
              key={step.title}
              className="relative flex flex-col gap-3 rounded-[1.5rem] border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#151c1b]"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-background-green text-brand dark:bg-[#16352f] dark:text-[#48c0b8]">
                  <Icon className="size-6" />
                </span>
                <span className="text-3xl font-extrabold text-brand/15 dark:text-white/10">
                  {index + 1}
                </span>
              </div>

              <h3 className="text-base font-bold text-foreground sm:text-lg">
                {step.title}
              </h3>
              <p className="text-sm leading-7 text-[#7a7a7a] dark:text-white/60">
                {step.description}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
