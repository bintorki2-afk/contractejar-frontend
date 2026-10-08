"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { deleteAccount } from "@/features/auth/services/delete-account";
import { useAuthStore } from "@/features/auth/stores/use-auth-store";

const LOCAL_KEYS = [
  "aqdi-create-contract-draft",
  "aqdi-create-property-draft",
  "aqdi-create-unit-draft",
  "aqdi-auth-user",
  "aqdi-notifications-inbox",
  "aqdi-lessor-change-draft",
];

export default function AccountDeleteContent() {
  const clearUser = useAuthStore((state) => state.clearUser);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleDelete() {
    if (!confirmed || busy) return;
    setBusy(true);
    try {
      const result = await deleteAccount();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      clearUser();
      try {
        LOCAL_KEYS.forEach((key) => localStorage.removeItem(key));
      } catch {
        // Storage unavailable — nothing to clear.
      }
      setDone(true);
    } catch {
      toast.error("تعذّر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-sm dark:bg-[#1a2421]">
        <CheckCircle2 className="size-10 text-brand" aria-hidden="true" />
        <h1 className="text-xl font-extrabold text-brand">تم حذف حسابك</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          حذفنا بياناتك الشخصية من حسابك وأُغلقت جلستك. تبقى سجلات العقود والفواتير المدفوعة محفوظة
          للمدة التي تفرضها الأنظمة المحاسبية.
        </p>
        <Button asChild className="h-11 rounded-xl px-6">
          <a href="/">العودة للرئيسية</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-5 rounded-3xl bg-white p-6 shadow-sm md:p-8 dark:bg-[#1a2421]">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fff1f1] text-destructive">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-brand">حذف الحساب</h1>
          <p className="text-sm leading-7 text-muted-foreground">
            عند الحذف نُزيل بياناتك الشخصية من الحساب (الاسم، البريد، الجوال، رمز الإشعارات)
            ونغلق جميع جلساتك. لا يمكن التراجع عن ذلك.
          </p>
        </div>
      </div>

      <ul className="list-disc space-y-1 ps-6 text-sm leading-7 text-[#555555] dark:text-[#c9d6d1]">
        <li>تبقى سجلات العقود والفواتير المدفوعة محفوظة للأغراض النظامية والمحاسبية.</li>
        <li>العقود الموثّقة في منصة إيجار لا تتأثر بحذف الحساب.</li>
        <li>للاستفسار قبل الحذف تواصل معنا عبر واتساب من صفحة الدعم.</li>
      </ul>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#f2c7c7] bg-[#fff8f8] p-3 text-sm leading-6 dark:border-[#5c2a2a] dark:bg-[#2a1818]">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
          className="mt-1 size-4 accent-[#c62828]"
        />
        <span>أفهم أن حذف الحساب نهائي وأرغب بالمتابعة.</span>
      </label>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="destructive"
          disabled={!confirmed || busy}
          onClick={() => void handleDelete()}
          className="h-11 rounded-xl px-6"
        >
          {busy ? "جاري الحذف..." : "حذف حسابي نهائياً"}
        </Button>
        <Button asChild variant="outline" className="h-11 rounded-xl px-6">
          <Link href="/">إلغاء</Link>
        </Button>
      </div>
    </div>
  );
}
