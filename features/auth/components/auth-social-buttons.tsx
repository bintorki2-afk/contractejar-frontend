"use client";

import { FaGoogle } from "react-icons/fa";
import { useTranslations } from "next-intl";

import { BASE_URL } from "@/lib/api/constants";

// Use the shared API base (env var, else the Railway fallback) so the social
// redirect always targets the backend — not a relative same-origin URL, which
// 404s when NEXT_PUBLIC_BASE_URL isn't exposed to the client build.
const API_BASE_URL = BASE_URL;

/**
 * Google sign-in. This is a full-page navigation to the backend's Socialite
 * redirect route (OAuth is redirect-based, not fetch), which sends the user to
 * Google and back to /auth/social-callback with a token.
 *
 * The auth card is always light, so this uses one light outline style (no dark
 * variants) to stay consistent with the email/password inputs on the card.
 */
export default function AuthSocialButtons() {
  const t = useTranslations("auth.social");

  const baseClass =
    "flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#dcdcdc] bg-white text-sm font-semibold text-[#1a1a1a] shadow-sm transition-colors hover:bg-[#f7f7f7]";

  return (
    <div className="flex flex-col gap-3">
      <a href={`${API_BASE_URL}/auth/web/google/redirect`} className={baseClass}>
        <FaGoogle className="size-4 text-[#ea4335]" aria-hidden="true" />
        <span>{t("google")}</span>
      </a>

      {/*
        Apple sign-in is deferred until the Apple Services ID + signing key are
        ready on the backend. Re-enable this button (and the FaApple import) once
        the backend's apple provider is back in composer + configured.
      */}
    </div>
  );
}
