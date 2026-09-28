"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { Marquee } from "@/components/ui/marquee";

const featureLogos = [
  "/images/ejar.png",
  "/images/general-authority.png",
  "/images/saudi-center.png",
  "/images/hesab.png",
  "/images/daman.png",
  "/images/tegara.png",
  "/images/najez.png",
];

export default function HeroMarquee() {
  const t = useTranslations("hero");

  return (
    <div>
      <p className="text-start font-bold text-brand-secondary">
        {t("compliantWith")}
      </p>

      <div
        dir="ltr"
        className="relative mt-3 flex w-full flex-col items-center justify-center overflow-hidden"
      >
        <Marquee pauseOnHover className="[--duration:40s] [--gap:1.25rem]">
          {featureLogos.map((logo) => (
            <div
              key={logo}
              className="flex h-16 w-24 items-center justify-center rounded-2xl bg-white px-3 shadow-sm"
            >
              <Image
                src={logo}
                alt=""
                width={64}
                height={64}
                className="max-h-10 w-auto object-contain"
                sizes="64px"
              />
            </div>
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[10%] bg-linear-to-r from-brand-background-green" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[10%] bg-linear-to-l from-brand-background-green" />
      </div>
    </div>
  );
}
