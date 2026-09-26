import { cn } from "@/lib/utils";
import Link from "next/link";

type FooterBottomBarProps = {
  copyright: string;
  terms: string;
  privacy: string;
  termsHref: string;
  privacyHref: string;
  className?: string;
};

export default function FooterBottomBar({
  copyright,
  terms,
  privacy,
  termsHref,
  privacyHref,
  className,
}: FooterBottomBarProps) {
  return (
    <div className={cn("flex flex-col items-start justify-between gap-4 border-t border-border/70 pt-6 md:flex-row md:items-center", className)}>
      <p className="text-sm font-medium text-gray-600 dark:text-white/60">{copyright}</p>

      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/60 font-medium">
        <Link href={termsHref} className="transition hover:text-brand">
          {terms}
        </Link>
        <span>-</span>
        <Link href={privacyHref} className="transition hover:text-brand">
          {privacy}
        </Link>
      </div>
    </div>
  );
}
