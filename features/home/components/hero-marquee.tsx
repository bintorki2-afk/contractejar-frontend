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
    <div className="mt-1 w-full max-w-xl rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
      <p className="mb-2 text-start text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {t("compliantWith")}
      </p>

      <div
        dir="ltr"
        className="relative flex w-full flex-col items-center justify-center overflow-hidden"
      >
        <Marquee pauseOnHover className="[--duration:40s] [--gap:1.75rem]">
          {featureLogos.map((logo) => (
            <div
              key={logo}
              className="flex h-11 items-center justify-center px-2"
            >
              <Image
                src={logo}
                alt=""
                width={120}
                height={44}
                className="max-h-8 w-auto object-contain"
                sizes="120px"
              />
            </div>
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[8%] bg-linear-to-r from-white" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[8%] bg-linear-to-l from-white" />
      </div>
    </div>
  );
}
