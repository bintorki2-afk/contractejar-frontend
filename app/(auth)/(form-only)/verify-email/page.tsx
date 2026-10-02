import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

import AuthBackButton from "@/features/auth/components/auth-back-button";

type VerifyEmailPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const [t, { status }] = await Promise.all([
    getTranslations("auth.verifyEmail"),
    searchParams,
  ]);

  const success = status === "success";

  return (
    <>
      <div className="absolute top-6 inset-s-6 z-10">
        <AuthBackButton label={t("back")} href="/login" />
      </div>

      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl lg:rounded-[48px] lg:p-8">
        <div className="flex flex-col items-center gap-5 text-center">
          <span
            className={
              success
                ? "flex size-16 items-center justify-center rounded-full bg-brand text-white"
                : "flex size-16 items-center justify-center rounded-full bg-[#fdecec] text-[#d64545]"
            }
          >
            {success ? (
              <CheckCircle2 className="size-9" aria-hidden="true" />
            ) : (
              <XCircle className="size-9" aria-hidden="true" />
            )}
          </span>

          <h1 className="text-xl font-extrabold text-brand">
            {success ? t("successTitle") : t("invalidTitle")}
          </h1>
          <p className="text-sm leading-6 text-[#5b5b5b]">
            {success ? t("successHint") : t("invalidHint")}
          </p>

          <div className="mt-2 flex w-full flex-col gap-3">
            <Link
              href="/login"
              className="flex h-12 w-full items-center justify-center rounded-full bg-brand text-base font-semibold text-white transition-colors hover:bg-brand/90"
            >
              {t("goLogin")}
            </Link>
            <Link
              href="/"
              className="flex h-12 w-full items-center justify-center rounded-full border border-brand/25 text-base font-semibold text-brand transition-colors hover:bg-brand-background-green"
            >
              {t("goHome")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
