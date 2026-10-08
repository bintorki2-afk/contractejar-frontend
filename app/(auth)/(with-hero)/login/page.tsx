import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import AuthBackButton from "@/features/auth/components/auth-back-button";
import LoginHeader from "@/features/auth/components/login-header";
import PhoneLoginForm from "@/features/auth/components/phone-login-form";

/**
 * Sign-in is mobile + OTP only (same as the app). The email/password and
 * social components are kept in `features/auth` but no longer mounted.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("navbar");
  return { title: t("login") };
}

export default async function LoginPage() {
  const t = await getTranslations("auth.phoneLogin");

  return (
    <div className="relative flex flex-1 flex-col p-6">
      <div className="absolute top-6 inset-s-6">
        <AuthBackButton label={t("back")} />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 py-4">
        <LoginHeader greeting={t("greeting")} subtitle={t("subtitle")} />
        <Suspense fallback={null}>
          <PhoneLoginForm />
        </Suspense>
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          {t("firstTimeNote")}
        </p>
      </div>
    </div>
  );
}
