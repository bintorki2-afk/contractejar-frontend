"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { completeSocialLogin } from "@/features/auth/services/complete-social-login";
import { useAuthStore } from "@/features/auth/stores/use-auth-store";

export default function SocialCallbackPage() {
  const t = useTranslations("auth.social");
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) {
      return;
    }
    handled.current = true;

    const hash = window.location.hash.replace(/^#/, "");
    const token = new URLSearchParams(hash).get("token");

    // Drop the token from the address bar immediately.
    window.history.replaceState(null, "", window.location.pathname);

    if (!token) {
      toast.error(t("error"));
      router.replace("/login?error=social");
      return;
    }

    void completeSocialLogin(token)
      .then((result) => {
        if (!result.ok) {
          toast.error(result.error || t("error"));
          router.replace("/login?error=social");
          return;
        }

        setUser(result.user);
        router.replace("/");
      })
      .catch(() => {
        // Any unexpected failure must not surface the full-screen error page —
        // show a toast and send the user back to login to retry.
        toast.error(t("error"));
        router.replace("/login?error=social");
      });
  }, [router, setUser, t]);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-3xl bg-white p-10 text-center shadow-2xl lg:rounded-[48px]">
      <Loader2 className="size-8 animate-spin text-brand" aria-hidden="true" />
      <p className="text-sm font-medium text-[#5b5b5b]">{t("completing")}</p>
    </div>
  );
}
