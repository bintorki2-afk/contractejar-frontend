# سجلات البريد (SPF / DKIM / DMARC) وتحويل www — دليل ريان

> الدومين: `contractejar.com` · DNS في **Cloudflare** · الموقع على **Vercel**.
> البريد المُرسِل من الخادم (Laravel على Railway) مضبوط في `.env.example` للخادم:
> ```
> MAIL_FROM_ADDRESS=support@contractejar.com
> ```
> يعني رسائل الخادم (رموز التحقق بالبريد، الفواتير، التنبيهات) تخرج **من نطاق `contractejar.com`**،
> وبدون SPF وDMARC صحيحة تروح للسبام أو تُرفض (Gmail وOutlook يشترطانها منذ 2024).

---

## 1) قبل البدء: من هو مزوّد الـ SMTP؟

افتح Railway ← خدمة الخادم ← **Variables** وشف قيمة `MAIL_HOST` (لا تنسخ كلمة المرور لأي مكان).
القيمة تحدد سطر `include` في SPF:

| إذا `MAIL_HOST` = | المزوّد | سطر الـ include |
|---|---|---|
| `smtp.hostinger.com` | بريد Hostinger | `include:_spf.mail.hostinger.com` |
| `smtp.gmail.com` / `smtp-relay.gmail.com` | Google Workspace | `include:_spf.google.com` |
| `smtp.zoho.com` / `smtp.zoho.sa` | Zoho Mail | `include:zohomail.com` (أو كما تعرضه لوحة Zoho لمركز بياناتك) |
| `smtp-relay.brevo.com` | Brevo | `include:spf.brevo.com` |
| `smtp.sendgrid.net` | SendGrid | `include:sendgrid.net` |
| `email-smtp.<region>.amazonaws.com` | Amazon SES | `include:amazonses.com` |
| `smtp.office365.com` | Microsoft 365 | `include:spf.protection.outlook.com` |

> لو المزوّد غير موجود بالجدول: لوحة المزوّد ← «Domain authentication» / «SPF» تعطيك سطر الـ include حرفياً.

---

## 2) SPF — سجل واحد فقط

Cloudflare ← اختر `contractejar.com` ← **DNS** ← **Records** ← **Add record**:

| الحقل | القيمة |
|---|---|
| **Type** | `TXT` |
| **Name** | `@` |
| **Content** | `v=spf1 include:<سطر المزوّد من الجدول> ~all` |
| **TTL** | `Auto` |

مثال لبريد Hostinger:
```
v=spf1 include:_spf.mail.hostinger.com ~all
```

⚠️ **قواعد مهمة:**
- **سجل SPF واحد فقط** للنطاق. لو فيه سجل `v=spf1` موجود (مثلاً من Hostinger)، **عدّله** وأضف الـ include داخله بدل ما تضيف سجلاً ثانياً. مثال لمزوّدَين:
  ```
  v=spf1 include:_spf.mail.hostinger.com include:_spf.google.com ~all
  ```
- ابدأ بـ `~all` (تحذير)، وبعد أسبوعين من تقارير DMARC سليمة غيّرها إلى `-all` (رفض).
- لا تتجاوز 10 عمليات include.

---

## 3) DKIM — من لوحة المزوّد

DKIM توقيع رقمي يولّده المزوّد نفسه:
1. لوحة مزوّد البريد ← **Domain authentication / DKIM** ← اختر `contractejar.com` ← **Generate**.
2. يعطيك سجلاً (غالباً `TXT` أو `CNAME`) باسم مثل `default._domainkey` أو `s1._domainkey`.
3. Cloudflare ← **Add record** بنفس **Type** و**Name** و**Content** حرفياً.
4. ارجع للمزوّد واضغط **Verify**.

> سجلات `CNAME` الخاصة بالبريد في Cloudflare: اجعل **Proxy status** = **DNS only** (السحابة رمادية) — البرتقالية تكسر التحقق.

---

## 4) DMARC

Cloudflare ← **Add record**:

| الحقل | القيمة |
|---|---|
| **Type** | `TXT` |
| **Name** | `_dmarc` |
| **Content** | `v=DMARC1; p=none; rua=mailto:dmarc@contractejar.com; adkim=r; aspf=r; pct=100` |
| **TTL** | `Auto` |

- `rua` = بريد يستقبل التقارير اليومية (أنشئ `dmarc@contractejar.com` أو استخدم `support@`). بديل أسهل: Cloudflare ← **Email** ← **DMARC Management** ← **Enable** — يعطيك عنوان `rua` جاهزاً ويعرض التقارير كرسوم.
- **الخطة:** أسبوعان على `p=none` (مراقبة) ← إذا التقارير كلها `pass` غيّرها إلى `p=quarantine` ← بعد شهر `p=reject`.

---

## 5) التحقق

1. انتظر 5–30 دقيقة.
2. افتح [MXToolbox SPF](https://mxtoolbox.com/spf.aspx) و[MXToolbox DMARC](https://mxtoolbox.com/dmarc.aspx) واكتب `contractejar.com` ← لازم **Pass** بدون «multiple records».
3. أرسل رمز تحقق أو فاتورة من الموقع إلى بريد Gmail، افتح الرسالة ← ⋮ ← **Show original**: يجب أن ترى
   ```
   SPF: PASS · DKIM: PASS · DMARC: PASS
   ```

---

## 6) تحويل www إلى النطاق الأساسي (دائم 308) في Vercel

الهدف: `https://www.contractejar.com/أي-مسار` ← `https://contractejar.com/أي-مسار` بتحويل **دائم** (مهم للسيو: نسخة واحدة من كل صفحة، والـ canonical في الموقع على `contractejar.com`).

### 6-أ) Vercel
1. Vercel ← مشروع الموقع ← **Settings** ← **Domains**.
2. تأكد أن الاثنين مضافان: `contractejar.com` و`www.contractejar.com`.
3. `contractejar.com` ← **Edit** ← اختر **Connect to an environment** = `Production` (بدون Redirect).
4. `www.contractejar.com` ← **Edit** ← اختر **Redirect to Another Domain** ← `contractejar.com` ← نوع التحويل **308 Permanent Redirect** ← **Save**.

⚠️ لو كان `contractejar.com` نفسه مضبوطاً «Redirect to www» (الاقتراح الافتراضي في Vercel)، ألغه أولاً — وإلا يصير تحويل دائري. لا تضف تحويلاً في `vercel.json` أو الكود؛ إعداد Vercel يكفي.

### 6-ب) Cloudflare (DNS للموقع)

| Type | Name | Content | Proxy status |
|---|---|---|---|
| `A` | `@` | `76.76.21.21` | **DNS only** (رمادي) |
| `CNAME` | `www` | `cname.vercel-dns.com` | **DNS only** (رمادي) |

> القيم الدقيقة تعرضها Vercel بجانب كل دومين في صفحة **Domains** (لو ظهرت قيمة مختلفة، استخدم قيمة Vercel). البروكسي البرتقالي يسبب أخطاء شهادة SSL وحلقات تحويل مع Vercel.

### 6-ج) التحقق
من أي جهاز (Mac Terminal):
```bash
curl -sI https://www.contractejar.com/guide | head -3
```
المتوقع:
```
HTTP/2 308
location: https://contractejar.com/guide
```
أو شغّل `node scripts/post-deploy-check.mjs` (انظر `docs/post-deploy-checklist.md`) — يفحص التحويل ضمن البقية.
