"use client";

import { ChevronDown, ChevronUp, Info, Plus } from "lucide-react";
import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { CommonQuestion } from "@/features/faq/types/common-question";
import { cn } from "@/lib/utils";

type FaqAccordionListProps = {
  items: CommonQuestion[];
  variant: "section" | "page";
  limit?: number;
};

export default function FaqAccordionList({
  items,
  variant,
  limit,
}: FaqAccordionListProps) {
  const displayItems = limit ? items.slice(0, limit) : items;
  const [openId, setOpenId] = useState<string>(
    displayItems[1]?.id ?? displayItems[0]?.id ?? "",
  );

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <Accordion
      type="single"
      collapsible
      value={openId}
      onValueChange={setOpenId}
      className={cn(variant === "section" ? "space-y-4" : "space-y-3")}
    >
      {displayItems.map((item) => {
        const isOpen = openId === item.id;

        return (
          <AccordionItem key={item.id} value={item.id} className="border-none">
            <div
              className={cn(
                "w-full rounded-[1.65rem] px-4 py-3 md:px-6 md:py-4",
                variant === "section" &&
                  (isOpen ? "bg-white dark:bg-[#151c1b]" : "bg-transparent"),
                variant === "page" &&
                  "rounded-2xl px-5 py-4 transition-colors duration-200",
                variant === "page" &&
                  (isOpen ? "bg-brand-background" : "bg-transparent"),
              )}
            >
              <AccordionTrigger className="w-full py-0 hover:no-underline **:data-[slot=accordion-trigger-icon]:hidden">
                <div className="flex w-full items-center gap-4">
                  {isOpen ? (
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                      <Plus className="size-5" aria-hidden="true" />
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
                        variant === "section"
                          ? "bg-brand-background text-gray-500 dark:text-white/60"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Info className="size-5" aria-hidden="true" />
                    </span>
                  )}

                  <p
                    className={cn(
                      "flex-1 text-start font-medium",
                      variant === "section" && "text-lg",
                      variant === "section" &&
                        (isOpen ? "text-black dark:text-white/90" : "text-white"),
                      variant === "page" && "text-base font-semibold md:text-lg",
                      variant === "page" &&
                        (isOpen ? "text-brand" : "text-foreground"),
                    )}
                  >
                    {item.question}
                  </p>

                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center justify-center rounded-full transition-all duration-200",
                      variant === "section" &&
                        "mt-1 size-6",
                      variant === "section" &&
                        (isOpen
                          ? "size-8 bg-brand-secondary"
                          : "bg-brand-background text-brand-secondary"),
                      variant === "page" && "size-8",
                      variant === "page" &&
                        (isOpen
                          ? "bg-[#00a880]"
                          : "bg-muted text-muted-foreground"),
                    )}
                  >
                    {isOpen ? (
                      <ChevronUp className="size-4" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="size-4" aria-hidden="true" />
                    )}
                  </span>
                </div>
              </AccordionTrigger>

              <AccordionContent
                className={cn(
                  "pb-1 pt-2 text-base leading-8",
                  variant === "section" &&
                    "pe-14 ps-12 text-gray-600 dark:text-white/60",
                  variant === "page" &&
                    "pe-14 ps-14 pt-3 text-sm text-muted-foreground md:text-base",
                )}
              >
                {item.answer}
              </AccordionContent>
            </div>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
