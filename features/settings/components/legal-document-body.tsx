import type { LegalDocument } from "@/content/legal/types";
import { cn } from "@/lib/utils";

type LegalDocumentBodyProps = {
  document: LegalDocument;
  /** «آخر تحديث» label. */
  updatedAtLabel: string;
  /** Smaller type for dialogs. */
  dense?: boolean;
  className?: string;
};

function formatUpdatedAt(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
    timeZone: "UTC",
    dateStyle: "long",
  }).format(date);
}

/**
 * Renders a static legal document (privacy / terms) as readable Arabic
 * sections. The same text is exported to `docs/legal/*.html` for the
 * dashboard so the app shows identical content.
 */
export default function LegalDocumentBody({
  document,
  updatedAtLabel,
  dense = false,
  className,
}: LegalDocumentBodyProps) {
  return (
    <div
      className={cn(
        "text-[#4d4d4d] dark:text-white/75",
        dense ? "text-sm leading-7" : "text-sm leading-8 md:text-base",
        className,
      )}
    >
      <p className="text-xs font-semibold text-[#8a8a8a] dark:text-white/50">
        {updatedAtLabel}: {formatUpdatedAt(document.updatedAt)}
      </p>

      <div className="mt-4 space-y-3">
        {document.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {document.sections.map((section) => (
        <section key={section.heading} className={dense ? "mt-6" : "mt-8"}>
          <h2
            className={cn(
              "font-extrabold text-[#222222] dark:text-white/90",
              dense ? "text-base" : "text-lg md:text-xl",
            )}
          >
            {section.heading}
          </h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph} className="mt-2">
              {paragraph}
            </p>
          ))}
          {section.bullets ? (
            <ul className="mt-2 list-disc space-y-1.5 ps-5 marker:text-brand">
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
          {section.after?.map((paragraph) => (
            <p key={paragraph} className="mt-2">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
