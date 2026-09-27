import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

/** Locales the site ships translations for. Arabic is the default. */
export const SUPPORTED_LOCALES = ["ar", "en"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = "ar";
export const LOCALE_COOKIE = "NEXT_LOCALE";

function normalizeLocale(value: string | undefined): AppLocale {
  return value && SUPPORTED_LOCALES.includes(value as AppLocale)
    ? (value as AppLocale)
    : DEFAULT_LOCALE;
}

export default getRequestConfig(async () => {
  // Language is chosen by the visitor via the header switcher, which stores it
  // in the NEXT_LOCALE cookie. No URL change — Arabic (RTL) stays the default.
  const store = await cookies();
  const locale = normalizeLocale(store.get(LOCALE_COOKIE)?.value);

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
