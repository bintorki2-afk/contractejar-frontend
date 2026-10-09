# قائمة فحص ما بعد النشر — موقع «عقد إيجار»

> بعد كل دمج على `master` (Vercel ينشر تلقائياً) أو تغيير في الخادم على Railway.
> الجزء الآلي سكربت واحد يُشغَّل من جهازك (Mac) — الشلّ داخل بيئة Claude لا يصل للإنتاج.

---

## 1) الفحص الآلي (دقيقتان)

من مجلد الموقع على جهازك:

```bash
cd contractejar-frontend
git pull
node scripts/post-deploy-check.mjs
```

خيارات:

```bash
node scripts/post-deploy-check.mjs --no-psi                 # بدون PageSpeed (30 ثانية)
node scripts/post-deploy-check.mjs --json report.json       # حفظ النتيجة كملف
PSI_API_KEY=xxxx node scripts/post-deploy-check.mjs         # مفتاح PageSpeed (لو ظهر HTTP 429)
node scripts/post-deploy-check.mjs --site https://contractejar.com --api https://aqdi-new-backend-main-production.up.railway.app/api/v2
```

### ماذا يفحص

| المجموعة | الفحص | الفشل يعني |
|---|---|---|
| الصفحات | 14 صفحة عامة = 200، title، canonical على `contractejar.com`، noindex لـ `/track` و`/status` فقط، لا أثر للنطاق القديم | صفحة معطلة أو سيو خاطئ |
| robots/sitemap | `robots.txt` (Sitemap، منع `/api/`، لا `Disallow: /`)، `sitemap.xml` وكل روابطه على النطاق، وعيّنة روابط = 200 | قوقل لا يفهرس صح |
| التحويلات | `www` ← النطاق الأساسي **308/301** بنفس المسار، `http` ← `https` | نسخ مكررة / تحويل مؤقت |
| الأمان | CSP، HSTS، X-Frame-Options، nosniff، Referrer-Policy، وCSP يسمح بـ GTM/Google Ads/TikTok | ثغرة أو وسوم إعلانية محجوبة |
| روابط التطبيق | AASA وassetlinks = JSON صالح (أو 404 إذا لم تُضبط المتغيرات بعد) | الروابط لا تفتح التطبيق |
| الـ API | `/health` (قاعدة البيانات + المجدول)، `/status`، `/pricing`، وCORS للموقع | الخادم أو المجدول متوقف |
| PageSpeed (جوال) | الرئيسية، السكني، المدونة: أداء ≥ 70 وSEO ≥ 90 (وLCP/CLS/TBT) | تراجع أداء |

النتيجة: ✅ ناجح · ⚠️ تنبيه (راجعه) · ❌ فشل (رمز خروج 1 — لا تعتمد النشر قبل حله).

---

## 2) فحص يدوي (5 دقائق)

| # | الخطوة | المتوقع |
|---|---|---|
| 1 | افتح `https://contractejar.com` من الجوال | الرئيسية تفتح، الأسعار ظاهرة (من `/pricing`) |
| 2 | «ابدأ عقد سكني» ← عبّي الخطوة الأولى ← رجوع | المسودة محفوظة |
| 3 | `/track` برقم طلب حقيقي + الجوال | الحالة والرحلة صحيحة |
| 4 | `/status` | «كل الأنظمة تعمل بشكل طبيعي» |
| 5 | سجّل دخول بالجوال ← «طلباتي» ← «الإشعارات» | تظهر الإشعارات (والكود بزر نسخ للعروض) |
| 6 | GTM ← Preview على صفحة نجاح دفع تجريبي | `purchase` بقيمة وعملة ورقم طلب (انظر `docs/ads-tracking.md`) |
| 7 | Vercel ← Deployments ← آخر نشر ← **Runtime Logs** | لا أخطاء 500 متكررة |
| 8 | Sentry (إن مفعّل) | لا أخطاء جديدة بعد النشر |
| 9 | Railway ← خدمة الخادم ← Logs | `schedule:work` يعمل، لا أخطاء DB |

## 3) عند الفشل

| العرَض | أول خطوة |
|---|---|
| صفحات 500 | Vercel ← Deployments ← النشر السابق ← **Promote to Production** (رجوع فوري) |
| `/health` ❌ | Railway ← الخادم ← Restart؛ ثم راجع `OWNER-GUIDE.md` (خطة الطوارئ) في ريبو الخادم |
| www تحويل مؤقت 307 | `docs/dns-email.md` القسم 6 |
| CSP يحجب وسماً | Console المتصفح ← أضف النطاق في `next.config.ts` |
| PageSpeed هبط فجأة | قارن مع `docs/performance.md`؛ غالباً صورة كبيرة جديدة أو سكربت إعلاني |
