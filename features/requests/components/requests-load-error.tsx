"use client";

import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { clearExpiredSession } from "@/features/auth/services/clear-expired-session";
import { useAuthStore } from "@/features/auth/stores/use-auth-store";

type RequestsLoadErrorProps = {
  kind: "unauthorized" | "failed";
};

/**
 * Shown instead of «لا توجد لديك طلبات» when the list could not be loaded:
 * the customer must never conclude their orders are gone.
 */
export default function RequestsLoadError({ kind }: RequestsLoadErrorProps) {
  const router = useRouter();
  const clearUser = useAuthStore((state) => state.clearUser);
  const [busy, setBusy] = useState(false);

  async function handleLogin() {
    setBusy(true);
    try {
      await clearExpiredSession();
    } catch {
      // Continue to the login page regardless.
    }
    clearUser();
    window.location.assign(`/login?callbackUrl=${encodeURIComponent("/requests")}`);
  }

  return (
    <div className="container py-10">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl border border-[#f2c7c7] bg-[#fff5f5] p-6 text-center dark:border-[#5c2a2a] dark:bg-[#2a1818]">
        <AlertCircle className="size-8 text-destructive" aria-hidden="true" />
        <p className="text-base font-bold text-[#7a1f1f] dark:text-[#f8b4b4]">
          {kind === "unauthorized"
            ? "انتهت جلستك — سجّل الدخول من جديد لعرض طلباتك."
            : "تعذّر تحميل طلباتك الآن. طلباتك محفوظة — حاول مرة أخرى بعد قليل."}
        </p>
        {kind === "unauthorized" ? (
          <Button type="button" disabled={busy} onClick={() => void handleLogin()} className="h-11 rounded-xl px-6">
            تسجيل الدخول
          </Button>
        ) : (
          <Button type="button" onClick={() => router.refresh()} className="h-11 rounded-xl px-6">
            إعادة المحاولة
          </Button>
        )}
      </div>
    </div>
  );
}
