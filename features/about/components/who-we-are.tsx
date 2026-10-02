import { BadgeCheck, Clock, ShieldCheck } from "lucide-react";

import type { AboutHeroResolved } from "@/features/about/types/about-content";

type WhoWeAreProps = {
  content: AboutHeroResolved;
};

const highlights = [
  { icon: ShieldCheck, label: "معتمد عبر شبكة إيجار" },
  { icon: Clock, label: "توثيق خلال دقائق" },
  { icon: BadgeCheck, label: "يحفظ حقوق جميع الأطراف" },
];

export default function WhoWeAre({ content }: WhoWeAreProps) {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* soft decorative backdrop */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-secondary/10 blur-3xl dark:bg-brand-secondary/10"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/10"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/10"
      />

      <div className="container relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center md:gap-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-background-green px-4 py-1.5 text-xs font-semibold text-brand dark:bg-brand-secondary/15 dark:text-brand-secondary">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            {content.eyebrow}
          </span>

          <h1 className="text-4xl font-extrabold leading-relaxed text-brand md:text-5xl 2xl:text-6xl">
            <span className="block">{content.titleLine1}</span>
            {content.titleLine2 ? (
              <span className="block">{content.titleLine2}</span>
            ) : null}
          </h1>

          <p className="max-w-xl text-sm font-semibold leading-8 text-gray-500 dark:text-white/60 md:text-base">
            {content.description}
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            {highlights.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-white/70 px-4 py-2 text-sm font-semibold text-brand backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-brand-secondary"
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
