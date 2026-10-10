import { ArrowUpLeft } from "lucide-react";

import type { ArticleSource } from "@/features/blog/types/article";

type BlogDetailSourcesProps = {
  title: string;
  sources: ArticleSource[];
};

/**
 * QA WEB-21: citations to official bodies (`*.gov.sa`) keep passing trust;
 * any other domain — e.g. a competing contracts platform — is `nofollow`.
 */
export function sourceLinkRel(url: string): string {
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    /* relative or malformed → treat as external */
  }
  const official = host === "gov.sa" || host.endsWith(".gov.sa");
  return official ? "noopener noreferrer" : "noopener noreferrer nofollow";
}

export default function BlogDetailSources({
  title,
  sources,
}: BlogDetailSourcesProps) {
  return (
    <section className="space-y-4 text-start">
      <h2 className="text-xl font-extrabold text-brand md:text-2xl">{title}</h2>

      <ul className="space-y-2">
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel={sourceLinkRel(source.url)}
              className="inline-flex items-center gap-2 text-base font-semibold text-brand-secondary transition-colors hover:text-brand"
            >
              <ArrowUpLeft className="size-4 shrink-0" aria-hidden="true" />
              <span>{source.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
