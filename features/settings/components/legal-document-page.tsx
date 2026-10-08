import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

import type { LegalDocument } from "@/content/legal/types";
import LegalDocumentBody from "@/features/settings/components/legal-document-body";

type LegalDocumentPageProps = {
  document: LegalDocument;
  updatedAtLabel: string;
  contactTitle: string;
  contactBody: string;
  supportLabel: string;
  whatsappLabel: string;
  whatsappHref: string;
};

/**
 * Static legal page (privacy / terms). Content lives in `content/legal/*`
 * (the dashboard text is no longer used on the website — see the note in
 * `content/legal/types.ts`).
 */
export default function LegalDocumentPage({
  document,
  updatedAtLabel,
  contactTitle,
  contactBody,
  supportLabel,
  whatsappLabel,
  whatsappHref,
}: LegalDocumentPageProps) {
  return (
    <main className="bg-brand-background py-10 md:py-14">
      <div className="container">
        <article className="mx-auto max-w-3xl rounded-[28px] bg-white dark:bg-[#151c1b] p-6 shadow-[0_2px_24px_rgba(0,0,0,0.04)] md:p-10">
          <h1 className="text-3xl font-extrabold text-brand md:text-4xl">
            {document.title}
          </h1>

          <LegalDocumentBody
            document={document}
            updatedAtLabel={updatedAtLabel}
            className="mt-4"
          />

          <aside className="mt-10 rounded-2xl border border-brand/15 bg-brand-background-green p-5 dark:border-[#2f403b]">
            <p className="text-base font-extrabold text-brand dark:text-[#48c0b8]">
              {contactTitle}
            </p>
            <p className="mt-1 text-sm leading-7 text-[#4d5f5a] dark:text-white/70">
              {contactBody}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/support"
                className="inline-flex h-11 items-center rounded-full border border-brand/25 bg-white px-5 text-sm font-bold text-brand transition hover:bg-brand-background dark:bg-[#1a2421] dark:text-[#48c0b8]"
              >
                {supportLabel}
              </Link>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#25d366] px-5 text-sm font-bold text-white transition hover:bg-[#1ebe5a]"
              >
                <FaWhatsapp className="size-4" aria-hidden="true" />
                {whatsappLabel}
              </a>
            </div>
          </aside>
        </article>
      </div>
    </main>
  );
}
