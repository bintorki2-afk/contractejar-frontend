import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type FooterLinkItem = {
  label: string;
  href?: string;
};

type FooterLinksColumnProps = {
  title: string;
  items: FooterLinkItem[];
};

const linkClassName =
  "inline-flex min-h-10 items-center gap-2 py-1 text-sm text-foreground transition hover:text-brand";

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

export default function FooterLinksColumn({ title, items }: FooterLinksColumnProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-brand">{title}</h3>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.label}>
            {item.href ? (
              isExternalHref(item.href) ? (
                <a href={item.href} className={linkClassName}>
                  <ChevronLeft className="size-3.5 text-brand" aria-hidden="true" />
                  <span>{item.label}</span>
                </a>
              ) : (
                <Link href={item.href} className={linkClassName}>
                  <ChevronLeft className="size-3.5 text-brand" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              )
            ) : (
              <span className="inline-flex items-center gap-2 text-sm text-foreground">
                <ChevronLeft className="size-3.5 text-brand" aria-hidden="true" />
                <span>{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
