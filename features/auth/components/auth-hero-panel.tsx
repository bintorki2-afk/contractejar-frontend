import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { BadgeCheck, Clock, ShieldCheck } from "lucide-react";

/**
 * Brand panel beside the auth card. Built from the site's design tokens
 * (brand-background-green, brand green, shared type) so it matches the rest of
 * the site instead of a standalone baked image.
 */
export default async function AuthHeroPanel() {
  const t = await getTranslations("auth.hero");

  const features = [
    { icon: ShieldCheck, label: t("feature1") },
    { icon: Clock, label: t("feature2") },
    { icon: BadgeCheck, label: t("feature3") },
  ];

  return (
    <aside className="relative col-span-3 hidden min-h-[640px] overflow-hidden rounded-3xl bg-brand-background-green p-10 lg:block lg:rounded-[48px] xl:p-14">
      {/* decorative brand backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -start-24 size-80 rounded-full bg-brand-secondary/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -end-16 size-96 rounded-full bg-brand/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-20 top-1/2 size-[420px] -translate-y-1/2 rounded-full border border-brand/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-10 top-1/2 size-[300px] -translate-y-1/2 rounded-full border border-brand/10"
      />

      <div className="relative flex h-full min-h-[560px] flex-col">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt=""
            width={44}
            height={44}
            className="w-10 object-contain"
            aria-hidden="true"
          />
          <div className="space-y-0.5">
            <p className="text-xl font-bold text-brand dark:text-white">
              {t("brand")}
            </p>
            <p className="text-sm font-medium text-brand/70 dark:text-white/60">
              {t("tagline")}
            </p>
          </div>
        </div>

        <div className="mt-auto space-y-5">
          <h2 className="max-w-md text-3xl font-extrabold leading-[1.3] text-brand dark:text-white xl:text-4xl">
            {t("title")}
          </h2>
          <p className="max-w-sm text-base leading-relaxed text-brand/75 dark:text-white/75">
            {t("subtitle")}
          </p>

          <ul className="space-y-3 pt-2">
            {features.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-sm dark:bg-white/10 dark:text-[#8ff0d3]">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-bold text-brand dark:text-white/90">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
