import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, FileText } from "lucide-react";

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
  theme: TrustedEntityTheme;
};

const themeStyles: Record<
  TrustedEntityTheme,
  { card: string; link: string; divider: string }
> = {
  purple: {
    card: "border-t-[#7c3aed] bg-[#faf5ff] dark:bg-[#151c1b]",
    link: "text-[#7c3aed] dark:text-[#a78bfa] hover:text-[#6d28d9]",
    divider: "border-[#ede9fe] dark:border-[#262d2c]",
  },
  blue: {
    card: "border-t-[#2563eb] bg-[#eff6ff] dark:bg-[#151c1b]",
    link: "text-[#2563eb] dark:text-[#60a5fa] hover:text-[#1d4ed8]",
    divider: "border-[#dbeafe] dark:border-[#262d2c]",
  },
  teal: {
    card: "border-t-brand-secondary bg-brand-background-green dark:bg-[#151c1b]",
    link: "text-brand dark:text-[#48c0b8] hover:text-brand/80",
    divider: "border-brand/10 dark:border-[#262d2c]",
  },
};

export default function TrustedEntityCard({
  name,
  nameEn,
  description,
  viewLicense,
  licenseUrl,
  logoSrc,
  theme,
}: TrustedEntityCardProps) {
  const styles = themeStyles[theme];
  // Only show the "view license" action when a real URL is provided — a "#"
  // or empty value is a placeholder, so the dead button is hidden instead.
  const hasLicense =
    typeof licenseUrl === "string" &&
    licenseUrl.trim() !== "" &&
    licenseUrl.trim() !== "#";

  return (
    <article
      className={cn(
        "flex h-full flex-col gap-5  border-t-4 p-6 shadow-sm",
        styles.card
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-foreground">{name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{nameEn}</p>
        </div>
          <span className="relative inline-block h-[100px] w-25 shrink-0 dark:rounded-xl dark:bg-white dark:p-2">
            <Image
              src={logoSrc}
              alt=""
              fill
              className="object-contain dark:p-1"
              sizes="100px"
              aria-hidden="true"
              unoptimized={
                logoSrc.startsWith("http://") || logoSrc.startsWith("https://")
              }
            />
          </span>
      </div>

      <p className=" font-medium leading-relaxed text-gray-600 dark:text-white/60">
        {description}
      </p>

      {hasLicense ? (
        <div className={cn("mt-auto border-t pt-4", styles.divider)}>
          <Link
            href={licenseUrl}
            className={cn(
              "inline-flex items-center gap-2 text-sm font-bold transition-colors group",
              styles.link
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CustomIcon src="/icons/doc-markdown.svg" size={16} />
            <span>{viewLicense}</span>
            <ArrowUpLeft className="size-3.5 shrink-0 group-hover:-rotate-45 transition-transform duration-300" aria-hidden="true" />
          </Link>
        </div>
      ) : null}
    </article>
  );
}
