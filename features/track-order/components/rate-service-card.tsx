"use client";

import { Star } from "lucide-react";
import { FaApple, FaGooglePlay, FaWhatsapp } from "react-icons/fa";

import { useWhatsappHref } from "@/features/settings/hooks/use-whatsapp-href";
import { track } from "@/lib/analytics/track";

// Optional store review links (Vercel env): shown only when set.
const APP_STORE_REVIEW_URL = process.env.NEXT_PUBLIC_APP_STORE_REVIEW_URL || "";
const PLAY_STORE_REVIEW_URL = process.env.NEXT_PUBLIC_PLAY_STORE_REVIEW_URL || "";

/**
 * «قيّم الخدمة» (item 37-lite) — بعد التوثيق: تقييم عبر واتساب (رسالة جاهزة
 * برقم الطلب) + روابط المتجر عند ضبطها.
 */
export default function RateServiceCard({ orderNumber }: { orderNumber: string }) {
  const whatsappBase = useWhatsappHref();
  const text = `أبغى أقيّم خدمة «عقد إيجار» لطلبي رقم ${orderNumber}: ⭐⭐⭐⭐⭐\nملاحظاتي: `;
  const whatsappHref = `${whatsappBase}${whatsappBase.includes("?") ? "&" : "?"}text=${encodeURIComponent(text)}`;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
      <div className="flex items-center gap-2">
        <span className="flex text-amber-500" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="size-4 fill-current" />
          ))}
        </span>
        <p className="text-sm font-extrabold text-amber-900 dark:text-amber-200">قيّم الخدمة</p>
      </div>
      <p className="mt-1 text-xs leading-6 text-amber-900/80 dark:text-amber-200/80">
        تم توثيق عقدك 🎉 رأيك يهمّنا ويساعد غيرك يختار — يأخذ أقل من دقيقة.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("cta_whatsapp_click", { placement: "rate_service" })}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-bold text-white transition hover:opacity-90"
        >
          <FaWhatsapp className="size-4" aria-hidden="true" />
          قيّمنا عبر واتساب
        </a>
        {APP_STORE_REVIEW_URL ? (
          <a
            href={APP_STORE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border bg-white px-4 text-sm font-bold text-foreground transition hover:bg-muted dark:bg-transparent"
          >
            <FaApple className="size-4" aria-hidden="true" />
            App Store
          </a>
        ) : null}
        {PLAY_STORE_REVIEW_URL ? (
          <a
            href={PLAY_STORE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border bg-white px-4 text-sm font-bold text-foreground transition hover:bg-muted dark:bg-transparent"
          >
            <FaGooglePlay className="size-4" aria-hidden="true" />
            Google Play
          </a>
        ) : null}
      </div>
    </div>
  );
}
