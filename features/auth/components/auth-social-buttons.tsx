"use client";

import { FaApple, FaGoogle } from "react-icons/fa";
import { useTranslations } from "next-intl";

import { BASE_URL } from "@/lib/api/constants";

// Use the shared API base (env var, else the Railway fallback) so the social
// redirect always targets the backend — not a relative same-origin URL, which
// 404s when NEXT_PUBLIC_BASE_URL isn't exposed to the client build.
const API_BASE_URL = BASE_URL;

/**
 * Google / Apple sign-in. These are full-page navigations to the backend's
 * Socialite redirect route (OAuth is redirect-based, not fetch), which sends
 * the user to the provider and back to /auth/social-callback with a token.
 */
export default function AuthSocialButtons() {
  const t = useTranslations("auth.social");

  const baseClass =
    "flex h-12 w-full items-center justify-center gap-3 rounded-full border text-sm font-semibold transition-colors";

  return (
    <div className="flex flex-col gap-3">
      <a
        href={`${API_BASE_URL}/auth/web/google/redirect`}
        className={`${baseClass} border-[#d6d6d6] bg-white text-[#3c4043] hover:bg-[#f7f7f7] dark:border-[#2f403b] dark:bg-[#121a18] dark:text-white`}
      >
        <FaGoogle className="size-4 text-[#ea4335]" aria-hidden="true" />
        <span>{t("google")}</span>
      </a>

      <a
        href={`${API_BASE_URL}/auth/web/apple/redirect`}
        className={`${baseClass} border-black bg-black text-white hover:bg-black/90 dark:border-white/20`}
      >
        <FaApple className="size-5" aria-hidden="true" />
        <span>{t("apple")}</span>
      </a>
    </div>
  );
}
