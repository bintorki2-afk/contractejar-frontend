import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";

// Conversion block rendered at the end of every article: turns readers into
// contract creators. Links straight to the (no-login) create-contract flow.
// Text is localized (blog.cta) so it follows the visitor's chosen language.
export default async function BlogArticleCta() {
  const t = await getTranslations("blog.cta");

  return (
    <div className="rounded-3xl bg-brand px-6 py-8 text-white md:px-10 md:py-10">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
        <h2 className="text-2xl font-extrabold leading-snug md:text-3xl">
          {t("title")}
        </h2>
        <p className="text-base leading-8 text-white/85 md:text-lg">
          {t("description")}
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {/* QA WEB-16: one link styled as a button — not a <button> inside an <a>. */}
          <Button
            asChild
            className="h-12 w-full gap-3 rounded-full bg-white px-6 text-sm font-semibold text-brand dark:!text-[#005848] hover:bg-white/90 sm:w-auto"
          >
            <Link href="/create-contract?id=residential">
              <span>{t("residentialCta")}</span>
              <ArrowUpLeft className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 w-full gap-3 rounded-full border-white/40 bg-transparent px-6 text-sm font-semibold text-white hover:bg-white/10 hover:text-white sm:w-auto"
          >
            <Link href="/create-contract?id=commercial">
              <span>{t("commercialCta")}</span>
              <ArrowUpLeft className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
