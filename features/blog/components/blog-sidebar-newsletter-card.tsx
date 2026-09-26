"use client";

import { ArrowLeft, ArrowUpLeft, Mail } from "lucide-react";
import { useState } from "react";

import CustomIcon from "@/features/shared/components/custom-icon";

type BlogSidebarNewsletterCardProps = {
  badge: string;
  title: string;
  description: string;
  placeholder: string;
  subscribeLabel: string;
  submitEmailLabel: string;
};

export default function BlogSidebarNewsletterCard({
  badge,
  title,
  description,
  placeholder,
  subscribeLabel,
  submitEmailLabel,
}: BlogSidebarNewsletterCardProps) {
  const [email, setEmail] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmail("");
  }

  return (
    <div className="rounded-[32px] bg-brand-background-green p-6 md:p-8">
      <div className="flex flex-col items-strat ">
        <CustomIcon
          src="/icons/news-letter.svg"
          size={40}
          className="mb-4 text-brand self-start"
        />

        <p className="mb-1 text-xs font-medium text-muted-foreground">{badge}</p>
        <h2 className="mb-2 text-lg font-extrabold text-brand md:text-xl">
          {title}
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <div className="flex h-14 items-center gap-2 rounded-full bg-white px-2 ps-3 dark:bg-[#151c1b]">
          <Mail className="size-4 shrink-0 text-brand" aria-hidden="true" />

          <span
            className="h-5 w-px shrink-0 bg-[#e0e0e0] dark:bg-[#262d2c]"
            aria-hidden="true"
          />

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={placeholder}
            className="min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-[#bdbdbd] placeholder:text-[10px]"
          />

          <button
            type="submit"
            aria-label={submitEmailLabel}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-sm transition-colors hover:text-brand-secondary dark:bg-[#151c1b]"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
        </div>

        <button
          type="submit"
          className="flex h-14 w-full items-center justify-between rounded-full bg-brand-secondary px-2 ps-5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <span>{subscribeLabel}</span>
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-brand">
            <ArrowUpLeft className="size-4" aria-hidden="true" />
          </span>
        </button>
      </form>
    </div>
  );
}
