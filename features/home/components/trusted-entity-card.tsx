import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import CustomIcon from "@/features/shared/components/custom-icon";

type TrustedEntityTheme = "purple" | "blue" | "teal";

type TrustedEntityCardProps = {
  name: string;
  nameEn: string;
  description: string;
  viewLicense: string;
  licenseUrl: string;
  logoSrc: string;
  /** Kept for data compatibility; the section now uses one unified brand identity. */
  theme?: TrustedEntityTheme;
};

export default function TrustedEntityCard({
  name,
  nameEn,
  description,
  viewLicense,
  licenseUrl,
  logoSrc,
}: TrustedEntityCardProps) {
  // Only show the "view license" action when a real URL is provided — a "#"
  // or empty value is a placeholder, so the dead button is hidden instead.
  const hasLicense =
    typeof licenseUrl === "string" &&
    licenseUrl.trim() !== "" &&
    licenseUrl.trim() !== "#";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col items-center gap-4 overflow-hidden rounded-2xl border border-brand/15 bg-white p-7 text-center shadow-sm transition-all duration-300",
        "hover:-translate-y-1.5 hover:border-brand/30 hover:shadow-[0_22px_44px_-12px_rgba(14,106,90,0.28)]",
        "dark:border-white/10 dark:bg-[#111a18] dark:hover:border-brand-secondary/40",
      )}
    >
      {/* unified brand accent + soft glow on hover */}
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-brand-secondary to-brand" />
      <span className="pointer-events-none absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-brand-secondary/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      {/* logo tile */}
      <span className="relative flex h-24 w-36 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
        <Image
          src={logoSrc}
          alt=""
          width={120}
          height={64}
          className="max-h-16 w-auto object-contain"
          sizes="120px"
          aria-hidden="true"
          unoptimized={
            logoSrc.startsWith("http://") || logoSrc.startsWith("https://")
          }
        />
      </span>

      {/* verified badge */}
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-background-green px-3 py-1 text-[11px] font-bold text-brand dark:bg-brand-secondary/15 dark:text-brand-secondary">
        <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
        جهة معتمدة
      </span>

      <div>
        <h3 className="text-lg font-bold text-foreground">{name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{nameEn}</p>
      </div>

      <p className="text-sm font-medium leading-relaxed text-gray-600 dark:text-white/60">
        {description}
      </p>

      {hasLicense ? (
        <div className="mt-auto w-full border-t border-brand/10 pt-4 dark:border-white/10">
          <Link
            href={licenseUrl}
            className="group/link inline-flex items-center gap-2 text-sm font-bold text-brand transition-colors hover:text-brand/80 dark:text-brand-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <CustomIcon src="/icons/doc-markdown.svg" size={16} />
            <span>{viewLicense}</span>
            <ArrowUpLeft
              className="size-3.5 shrink-0 transition-transform duration-300 group-hover/link:-rotate-45"
              aria-hidden="true"
            />
          </Link>
        </div>
      ) : null}
    </article>
  );
}
