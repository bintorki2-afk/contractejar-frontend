"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";

import CustomIcon from "@/features/shared/components/custom-icon";
import { cn } from "@/lib/utils";

type NavbarTopBarProps = {
  aboutUs: string;
  blog: string;
  faq: string;
  httpsSecurity: string;
  httpfor: string;
  officialLinks: string;
  endWith: string;
  whatsappService: string;
  whatsappHref: string;
  scrolled: boolean;
};

export default function NavbarTopBar({
  aboutUs,
  blog,
  faq,
  httpsSecurity,
  officialLinks,
  whatsappService,
  whatsappHref,
  httpfor,
  endWith,
  scrolled,
}: NavbarTopBarProps) {
  const pathname = usePathname();
  const linkClassName =
    "font-bold text-black dark:text-white/85 transition-colors hover:text-brand";

  return (
    <div
      className={cn(
        "hidden grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-300 ease-out lg:grid",
        scrolled && "pointer-events-none grid-rows-[0fr] opacity-0",
      )}
      aria-hidden={scrolled}
    >
      <div className="overflow-hidden">
        <div className="flex items-center justify-between gap-y-2 py-2.5 text-sm">
          <div className="flex items-center gap-x-2 gap-y-1 2xl:gap-x-5">
            <Link
              href="/about"
              className={cn(
                linkClassName,
                pathname === "/about" && "text-brand",
              )}
            >
              {aboutUs}
            </Link>
            <Link
              href="/blog"
              className={cn(
                linkClassName,
                pathname === "/blog" && "text-brand",
              )}
            >
              {blog}
            </Link>
            <Link
              href="/faq"
              className={cn(linkClassName, pathname === "/faq" && "text-brand")}
            >
              {faq}
            </Link>
          </div>

          <div className="flex items-center gap-x-2 gap-y-2 2xl:gap-x-5">
            <span className="inline-flex items-center gap-1.5 font-bold text-brand-secondary">
              <CustomIcon
                src="/icons/lock.svg"
                size={14}
                className="text-brand"
              />
              {httpsSecurity}
              <span className="text-black dark:text-white/85">{httpfor}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold text-brand-secondary">
              <CustomIcon
                src="/icons/link.svg"
                size={14}
                className="text-brand"
              />
              {officialLinks}
              <span className="text-black dark:text-white/85">{endWith}</span>
            </span>
          </div>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-gray-600 dark:text-white/60 transition-colors hover:text-brand"
          >
            {whatsappService}
            <FaWhatsapp className="size-6 shrink-0 text-green-500" />
          </a>
        </div>
      </div>
    </div>
  );
}
