import { FolderOpen, ListChecks, MessageCircle } from "lucide-react";
import type { ComponentType } from "react";

import type { RequestsHowItWorksStep } from "@/features/requests/types/request-labels";

type RequestsHowItWorksProps = {
  title: string;
  subtitle: string;
  steps: RequestsHowItWorksStep[];
};

const STEP_ICONS: ComponentType<{ className?: string }>[] = [
  ListChecks,
  FolderOpen,
  MessageCircle,
];

/**
 * Explains "طلباتي" to the customer: track status, everything in one place,
 * quick follow-up. Mirrors the عقاراتي explainer for a consistent feel.
 */
export default function RequestsHowItWorks({
  title,
  subtitle,
  steps,
}: RequestsHowItWorksProps) {
  if (!steps?.length) {
    return null;
  }

  return (
    <section className="mt-2 sm:mt-4">
      <div className="mb-5 space-y-2 sm:mb-7">
        <h2 className="text-xl font-extrabold text-brand dark:text-white sm:text-2xl">
          {title}
        </h2>
        <p className="max-w-2xl text-sm leading-7 text-[#5b5b5b] dark:text-white/65 sm:text-base">
          {subtitle}
        </p>
      </div>

      <ol className="grid gap-4 sm:grid-cols-3 sm:gap-5">
        {steps.map((step, index) => {
          const Icon = STEP_ICONS[index] ?? ListChecks;

          return (
            <li
              key={step.title}
              className="relative flex flex-col gap-3 rounded-[1.5rem] border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#151c1b]"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-brand/15 dark:text-white/10">
                  {index + 1}
                </span>
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-background-green text-brand dark:bg-[#16352f] dark:text-[#48c0b8]">
                  <Icon className="size-6" />
                </span>
              </div>

              <h3 className="text-base font-bold text-foreground sm:text-lg">
                {step.title}
              </h3>
              <p className="text-sm leading-7 text-[#5b5b5b] dark:text-white/65">
                {step.description}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
