"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { Marquee } from "@/components/ui/marquee";

const featureLogos = [
  "/images/logos-white/ejar.png",
  "/images/logos-white/general-authority.png",
  "/images/logos-white/saudi-center.png",
  "/images/logos-white/hesab.png",
  "/images/logos-white/daman.png",
  "/images/logos-white/tegara.png",
  "/images/logos-white/najez.png",
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
              className="flex h-16 items-center justify-center px-5"
            >
              <Image
                src={logo}
                alt=""
                width={120}
                height={48}
                className="max-h-9 w-auto object-contain opacity-90"
                sizes="120px"
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
