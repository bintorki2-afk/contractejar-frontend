import { getTranslations } from "next-intl/server";

import FooterBottomBar from "@/features/footer/components/footer-bottom-bar";
import FooterBrand from "@/features/footer/components/footer-brand";
import FooterLinksColumn from "@/features/footer/components/footer-links-column";
import FooterNewsletter from "@/features/footer/components/footer-newsletter";
import FooterSupportColumn from "@/features/footer/components/footer-support-column";
import FooterTopBar from "@/features/footer/components/footer-top-bar";
import { getAppSettings } from "@/features/settings/services/get-app-settings";
import {
  resolveFooterPhone,
  resolveFooterPhoneHref,
  resolveFooterSocialLinks,
} from "@/features/settings/utils/resolve-footer-contact";

type FooterLinkItem = {
  label: string;
  href?: string;
};

export default async function Footer() {
  const [t, settings] = await Promise.all([
    getTranslations("footer"),
    getAppSettings(),
  ]);

  const quickLinks = t.raw("quickLinks.items") as FooterLinkItem[];
  const importantLinks = t.raw("importantLinks.items") as FooterLinkItem[];
  const licenses = t.raw("licenses.items") as FooterLinkItem[];
  const socialLinks = resolveFooterSocialLinks(settings);
  const phone = resolveFooterPhone(settings, t("support.phone"));
  const phoneHref = resolveFooterPhoneHref(settings);

  return (
    <footer className="border-t border-border/60 bg-white dark:bg-[#151c1b] py-12 md:py-14">
      <div className="container space-y-10">
        <FooterTopBar
          followUs={t("followUs")}
          securePayments={t("securePayments")}
          paymentsAlt={t("paymentsAlt")}
          socialLinks={socialLinks}
        />

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-7 lg:gap-12">
          <div className="space-y-5 lg:col-span-2">
            <FooterBrand description={t("description")} />
            <FooterNewsletter
              placeholder={t("newsletterPlaceholder")}
              submitLabel={t("newsletterSubmit")}
            />
          </div>

          <FooterLinksColumn title={t("quickLinks.title")} items={quickLinks} />
          <FooterLinksColumn
            title={t("importantLinks.title")}
            items={importantLinks}
          />
          <FooterLinksColumn title={t("licenses.title")} items={licenses} />

          <FooterSupportColumn
            title={t("support.title")}
            phone={phone}
            phoneHref={phoneHref}
            weekdaysHours={t("support.weekdaysHours")}
            saturdayHours={t("support.saturdayHours")}
            email={t("support.email")}
          />
        </div>

        <FooterBottomBar
          copyright={t("copyright", { year: String(new Date().getFullYear()) })}
          terms={t("terms")}
          privacy={t("privacy")}
          termsHref={t("termsHref")}
          privacyHref={t("privacyHref")}
        />
      </div>
    </footer>
  );
}
