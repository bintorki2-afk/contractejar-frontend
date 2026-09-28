import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
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
import GtmNoScript from "@/features/analytics/components/gtm-noscript";
import CookieNotice from "@/features/analytics/components/cookie-notice";
import {
  ThemeProvider,
  THEME_NO_FLASH_SCRIPT,
} from "@/features/shared/theme/theme-provider";
import SiteBackground from "@/features/shared/components/site-background";
import InstallPrompt from "@/features/shared/components/install-prompt";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://contractejar.com";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-sans-arabic",
  // Only weights used in UI (medium/semibold/bold/extrabold→700).
  // Loading 100–300 roughly doubles Arabic font payload and hurts mobile TBT/LCP.
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("site");
  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    openGraph: {
      title,
      description,
      siteName: title,
      locale: "ar_SA",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
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
  const [locale, messages, websiteStatus] = await Promise.all([
    getLocale(),
    getMessages(),
    getWebsiteStatus(),
  ]);
  const direction = getDirection(locale);

  // Boot check — before rendering routes. When the backend reports the website
  // as closed we render only the maintenance notice (no home / auth / contracts).
  const closedView = websiteStatus.isOpen
    ? null
    : await getWebsiteClosedView(websiteStatus, locale);

  // Organization + WebSite structured data (JSON-LD): يعرّف كيان «عقد إيجار»
  // (الاسم/الشعار/التواصل) لمحركات البحث ومحرّكات AI ليظهر كمصدر موثوق.
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "عقد إيجار",
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512.png`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+966597500014",
      contactType: "customer service",
      areaServed: "SA",
      availableLanguage: ["ar"],
    },
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
        <script
          // Applies the saved (or system) theme before first paint — no flash.
          dangerouslySetInnerHTML={{ __html: THEME_NO_FLASH_SCRIPT }}
        />
        <GtmNoScript />
        <GtmScripts />
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
