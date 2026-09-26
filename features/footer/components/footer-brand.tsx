import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

type FooterBrandProps = {
  description: string;
};

export default async function FooterBrand({ description }: FooterBrandProps) {
  const t = await getTranslations("navbar.brand");

  return (
    <div className="space-y-4">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/images/logo.png"
          alt=""
          width={100}
          height={100}
          className="w-16 shrink-0 object-contain"
          aria-hidden="true"
        />
        <div className="space-y-2">
          <p className="text-4xl font-extrabold text-brand">{t("name")}</p>
          <p className="font-medium text-gray-600 dark:text-white/60">{t("tagline")}...</p>
        </div>
      </Link>
      <p className="max-w-sm text-sm leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
