type LegalDocumentPageProps = {
  title: string;
  html: string;
  emptyLabel: string;
};

export default function LegalDocumentPage({
  title,
  html,
  emptyLabel,
}: LegalDocumentPageProps) {
  const hasContent = html.trim().length > 0;

  return (
    <main className="bg-brand-background py-10 md:py-14">
      <div className="container">
        <article className="mx-auto max-w-3xl rounded-[28px] bg-white dark:bg-[#151c1b] p-6 shadow-[0_2px_24px_rgba(0,0,0,0.04)] md:p-10">
          <h1 className="text-3xl font-extrabold text-brand md:text-4xl">
            {title}
          </h1>

          {hasContent ? (
            <div
              className="mt-8 space-y-4 text-sm leading-8 text-[#4d4d4d] dark:text-white/70 md:text-base [&_a]:font-bold [&_a]:text-brand [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-[#222222] dark:[&_h2]:text-white/90 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_li]:ms-5 [&_li]:list-disc [&_ol]:ms-5 [&_ol]:list-decimal [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_ul]:ms-5 [&_ul]:list-disc"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className="mt-8 text-sm leading-7 text-[#7a7a7a] dark:text-white/50 md:text-base">
              {emptyLabel}
            </p>
          )}
        </article>
      </div>
    </main>
  );
}
