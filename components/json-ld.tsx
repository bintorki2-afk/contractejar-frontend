/** Renders a JSON-LD structured-data block. `data` must be a plain object. */
export default function JsonLd({ data }: { data: Record<string, unknown> | null }) {
  if (!data) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      // JSON-LD must be inline; `<` is escaped so content can never close the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
