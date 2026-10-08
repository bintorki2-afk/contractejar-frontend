import type { Metadata } from "next";
import Link from "next/link";
import { Activity } from "lucide-react";

import PlatformStatusBoard from "@/features/platform-status/components/platform-status-board";
import { getPlatformStatus } from "@/features/platform-status/services/get-platform-status";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

// Live data on every request (the board then refreshes itself every 60 s).
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "حالة المنصة",
  description: "حالة خدمات منصة عقد إيجار الآن: الطلبات، قاعدة البيانات، الإشعارات، وبوابة الدفع.",
  path: "/status",
  noindex: true,
});

/**
 * صفحة حالة المنصة العامة (item 42) — تقرأ `GET /api/v2/status` (B20).
 * لا تعرض أي بيانات شخصية ولا تفاصيل تقنية؛ فقط حالة كل خدمة.
 */
export default async function StatusPage() {
  const initial = await getPlatformStatus();

  return (
    <main className="py-14 md:py-20">
      <div className="container flex flex-col gap-10">
        <div className="flex flex-col gap-4 text-center">
          <nav className="mx-auto text-xs text-muted-foreground">
            <Link href="/" className="inline-flex min-h-10 items-center px-1 transition hover:text-brand">
              الرئيسية
            </Link>
            <span className="px-2">/</span>
            <span className="text-foreground">حالة المنصة</span>
          </nav>
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-brand-secondary/10 p-2 text-sm font-bold text-brand">
            <span className="flex size-7 items-center justify-center rounded-full bg-brand text-white">
              <Activity className="size-4" aria-hidden="true" />
            </span>
            <span>حالة المنصة</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">هل كل شيء يعمل؟</h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground">
            نعرض هنا حالة خدمات «عقد إيجار» لحظة بلحظة. إذا واجهت مشكلة والصفحة تقول إن كل شيء سليم، تواصل معنا من{" "}
            <Link href="/support" className="font-bold text-brand underline-offset-4 hover:underline">
              صفحة الدعم
            </Link>
            .
          </p>
        </div>

        <PlatformStatusBoard initial={initial} />
      </div>
    </main>
  );
}
