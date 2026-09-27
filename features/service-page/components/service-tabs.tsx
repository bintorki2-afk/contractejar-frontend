"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

type FaqItem = { q: string; a: string };

type ServiceTabsProps = {
  labels: { steps: string; requirements: string; faq: string };
  steps: string[];
  requirements: string[];
  faq: FaqItem[];
};

type TabKey = "steps" | "requirements" | "faq";

export default function ServiceTabs({
  labels,
  steps,
  requirements,
  faq,
}: ServiceTabsProps) {
  const [tab, setTab] = useState<TabKey>("steps");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "steps", label: labels.steps },
    { key: "requirements", label: labels.requirements },
    { key: "faq", label: labels.faq },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-border/60">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "-mb-px border-b-2 px-4 py-3 text-sm font-bold transition-colors",
              tab === item.key
                ? "border-brand text-brand"
                : "border-transparent text-muted-foreground hover:text-brand",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="pt-6">
        {tab === "steps" ? (
          <ol className="space-y-4">
            {steps.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-extrabold text-white">
                  {i + 1}
                </span>
                <p className="pt-1 text-sm leading-7 text-foreground md:text-base">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        ) : null}

        {tab === "requirements" ? (
          <ul className="space-y-3">
            {requirements.map((req) => (
              <li key={req} className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-background text-brand">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                <p className="text-sm leading-7 text-foreground md:text-base">
                  {req}
                </p>
              </li>
            ))}
          </ul>
        ) : null}

        {tab === "faq" ? (
          <div className="space-y-3">
            {faq.map((item, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={item.q}
                  className="overflow-hidden rounded-2xl border border-border/60 bg-white dark:bg-[#121a18]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-start"
                  >
                    <span className="text-sm font-bold text-foreground">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-brand transition-transform duration-300",
                        open && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {open ? (
                    <p className="px-4 pb-4 text-sm leading-7 text-muted-foreground">
                      {item.a}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
