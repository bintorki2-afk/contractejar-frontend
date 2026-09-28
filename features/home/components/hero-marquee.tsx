"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

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
    <div className="container pb-8">
      <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/5">
        <p className="mb-3 text-end text-sm font-bold text-[#0a6b57]">
          {t("compliantWith")}
        </p>
        <div className="flex items-center gap-6 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-4 md:justify-between md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
          {featureLogos.map((logo) => (
            <div
              key={logo}
              className="flex h-11 shrink-0 items-center justify-center md:flex-1"
            >
              <Image
                src={logo}
                alt=""
                width={140}
                height={44}
                className="max-h-9 w-auto object-contain"
                sizes="140px"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
