# CLAUDE.md — contractejar-frontend (الموقع)

> 📌 سياق المشروع الكامل (أعمال + حسابات + نشر): اقرأ **@AQDI-CONTEXT.md**

@AGENTS.md

> دليل البدء للمطوّر الجديد: `كيف-تبدأ.md` · الأداء: `docs/performance.md` · أحداث التحويل: `docs/analytics-events.md`

## نبذة تقنية
موقع «عقد إيجار» العام — **Next.js 16.3 + React 19** (App Router)، عربي RTL، PWA + Sentry.

## الأوامر
```bash
npm install      # تثبيت المكتبات
npm run dev      # تشغيل محلي (http://localhost:3000)
npm run build    # بناء للإنتاج
npm run start    # تشغيل نسخة الإنتاج
```

## البنية
- الصفحات تحت `app/(main)/`: الرئيسية، `service/[type]` (إنشاء عقد سكني/تجاري)، `blog` + `blog/[slug]`، `guide`، `faq`، `reviews`، `about`، `support`، `notifications`، `privacy`، `terms` + صفحة `maintenance`.
- مكوّنات الواجهة في `components/ui/` (نظام shadcn كامل).
- مسارات API داخلية: `app/api/order` و `app/api/order-attachments` (استقبال الطلبات، تُرسل عبر Telegram + نسخ احتياطية اختيارية).

## الإعدادات (.env.local — انسخ من .env.example)
`NEXT_PUBLIC_BASE_URL` (الـ API) · مفاتيح Firebase · `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` · `NEXT_PUBLIC_GTM_ID` (قوقل تاق) · `NEXT_PUBLIC_SITE_URL` (SEO).

## النشر
Vercel (منطقة fra1) — فرع `master` ينشر تلقائياً. إعدادات في `vercel.json`.
