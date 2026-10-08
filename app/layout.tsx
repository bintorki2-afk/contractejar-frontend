import type { Metadata, Viewport } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { DirectionProvider } from "@/components/ui/direction";
import Providers from "@/app/providers";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SentryInit } from "@/components/sentry-init";
import WebsiteClosedScreen from "@/features/website-status/components/website-closed-screen";
import { getWebsiteStatus } from "@/features/website-status/services/get-website-status";
import { getWebsiteClosedView } from "@/features/website-status/utils/get-website-closed-view";
import PwaRegister from "@/components/pwa-register";
import GtmScripts from "@/features/analytics/components/gtm-scripts";
import ClarityScript from "@/features/analytics/components/clarity-script";
import GtmNoScript from "@/features/analytics/components/gtm-noscript";
import CookieNotice from "@/features/analytics/components/cookie-notice";
import {
  ThemeProvider,
  THEME_NO_FLASH_SCRIPT,
} from "@/features/shared/theme/theme-provider";
import SiteBackground from "@/features/shared/components/site-background";
import InstallPrompt from "@/features/shared/components/install-prompt";
import { DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/seo/page-metadata";
import { getAppSettings } from "@/features/settings/services/get-app-settings";
import {
  resolveFooterPhoneHref,
  resolveFooterSocialLinks,
} from "@/features/settings/utils/resolve-footer-contact";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://contractejar.com";

// Self-hosted (next/font/local) instead of next/font/google: the Google Fonts
// fetch at build time made CI non-deterministic (build aborts if fonts.googleapis.com
// is unreachable). Same font, same Arabic subset, weights 400/500/600/700 only
// (medium/semibold/bold/extrabold→700). Files live in app/fonts/*.woff2.
const ibmPlexSansArabic = localFont({
  variable: "--font-ibm-plex-sans-arabic",
  display: "swap",
  src: [
    { path: "./fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-sans-arabic-arabic-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-sans-arabic-arabic-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ibm-plex-sans-arabic-arabic-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("site");
  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    metadataBase: new URL(SITE_URL),
    // Page titles get the short brand suffix (≤ 60 chars overall); the home
    // page keeps the full descriptive default title.
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      locale: "ar_SA",
      type: "website",
      url: SITE_URL,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      title,
      statusBarStyle: "default",
    },
    icons: {
      icon: [
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0db38b",
};

const RTL_LOCALES = new Set(["ar", "fa", "he", "ur"]);

function getDirection(locale: string) {
  const baseLocale = locale.toLowerCase().split("-")[0];
  return RTL_LOCALES.has(baseLocale) ? "rtl" : "ltr";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, messages, websiteStatus, settings] = await Promise.all([
    getLocale(),
    getMessages(),
    getWebsiteStatus(),
    getAppSettings(),
  ]);
  const direction = getDirection(locale);

  // Boot check — before rendering routes. When the backend reports the website
  // as closed we render only the maintenance notice (no home / auth / contracts).
  const closedView = websiteStatus.isOpen
    ? null
    : await getWebsiteClosedView(websiteStatus, locale);

  // Organization + WebSite structured data (JSON-LD): يعرّف كيان «عقد إيجار»
  // (الاسم/الشعار/التواصل) لمحركات البحث ومحرّكات AI ليظهر كمصدر موثوق.
  // رقم الدعم وحسابات التواصل من إعدادات الخادم (لا أرقام ولا حسابات ثابتة في الكود).
  const supportTel = (resolveFooterPhoneHref(settings) ?? "tel:+966597500014").replace(/^tel:/, "");
  const socialProfiles = resolveFooterSocialLinks(settings).map((link) => link.href);
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "عقد إيجار",
    alternateName: "منصة توثيق عقود الإيجار",
    legalName: "مؤسسة عقدي العقارية",
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512.png`,
    image: `${SITE_URL}/og-image.png`,
    identifier: "CR 4650258662",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: supportTel,
      contactType: "customer service",
      areaServed: "SA",
      availableLanguage: ["ar"],
    },
    ...(socialProfiles.length > 0 ? { sameAs: socialProfiles } : {}),
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "عقد إيجار",
    url: SITE_URL,
    inLanguage: "ar",
  };

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${ibmPlexSansArabic.className} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Script
          id="theme-no-flash"
          strategy="beforeInteractive"
          // Applies the saved (or system) theme before first paint — no flash.
          dangerouslySetInnerHTML={{ __html: THEME_NO_FLASH_SCRIPT }}
        />
        <GtmNoScript />
        <GtmScripts />
        <ClarityScript />
        <PwaRegister />
        <SentryInit />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <SiteBackground />
        <ThemeProvider>
          {closedView ? (
            <WebsiteClosedScreen view={closedView} />
          ) : (
            <Providers>
              <DirectionProvider dir={direction} direction={direction}>
                <NextIntlClientProvider locale={locale} messages={messages}>
                  {children}
                  <InstallPrompt />
                  <CookieNotice />
                  <Toaster position="top-center" />
                </NextIntlClientProvider>
              </DirectionProvider>
            </Providers>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
