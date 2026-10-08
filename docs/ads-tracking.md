# ربط Google Ads وTikTok Pixel عبر GTM — خطوة بخطوة

> لموقع «عقد إيجار» (contractejar.com). كل الربط يتم من واجهة **Google Tag Manager** بدون أي تعديل في الكود.
> الموقع يرسل الأحداث جاهزة إلى `dataLayer` (المصدر: `lib/analytics/track.ts`، القائمة الكاملة: `docs/analytics-events.md`).
> أسماء الحقول أدناه مكتوبة **حرفياً كما تظهر في الواجهات الإنجليزية** لـ GTM وGoogle Ads وTikTok حتى تطابقها مباشرة.

---

## 0) المتطلبات (مرة واحدة)

1. حاوية GTM للموقع، ومعرّفها مضبوط في Vercel:
   ```
   NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
   ```
   ثم **Redeploy** (المتغير يُدمج وقت البناء).
2. **سياسة أمان المحتوى (CSP):** نطاقات Google Ads وTikTok وSnap مسموحة مسبقاً في `next.config.ts`:
   ```
   script-src: www.googleadservices.com · googleads.g.doubleclick.net · analytics.tiktok.com · sc-static.net
   frame-src:  td.doubleclick.net
   ```
   أي بكسل آخر (Meta، X…) يحتاج إضافة نطاقه هناك وإلا يُحجب بصمت.

---

## 1) الأحداث التي يرسلها الموقع

| الحدث | متى | المعاملات |
|---|---|---|
| `purchase` | بعد تأكيد الخادم أن الدفع نجح — **مرة واحدة لكل طلب** | `transaction_id` (رقم الطلب) · `value` (المبلغ المدفوع بالريال من الخادم) · `currency` = `SAR` · `contract_type` |
| `order_submitted` | إرسال الطلب للخادم (قبل الدفع) | `order_number` · `contract_type` |
| `lessor_change_submitted` | إرسال طلب تغيير المؤجر | `order_number` · `value` |
| `payment_started` | الانتقال لبوابة ميسر | `order_number` · `value` · `contract_type` |
| `wizard_start` | بداية المعالج | `contract_type` |
| `wizard_step` | كل خطوة في المعالج | `contract_type` · `step` (1..6 أو `review`) |
| `cta_whatsapp_click` | ضغط زر واتساب | `placement` |

**التحقق من `purchase` (مُختبر آلياً في `tests/purchase-event.test.ts`):**

```js
{ event: "purchase", transaction_id: "963031", value: 349, currency: "SAR", contract_type: "housing" }
```

- `value` رقم (ليس نصاً) ويأتي من الخادم فقط. إذا لم يؤكد الخادم مبلغاً يُحذف الحقل (لا يُرسل 0).
- `contract_type` = `housing` أو `commercial` أو `lessor_change`.
- لا يتكرر عند تحديث صفحة النجاح (حارس `sessionStorage`).

---

## 2) المتغيرات في GTM (Variables)

GTM ← **Variables** ← قسم **User-Defined Variables** ← **New** ← **Variable Configuration** ← **Data Layer Variable**.

أنشئ متغيراً لكل سطر (اسم المتغير في GTM يمين، و**Data Layer Variable Name** حرفياً يسار، و**Data Layer Version** = `Version 2`):

| اسم المتغير في GTM | Data Layer Variable Name |
|---|---|
| `DLV - transaction_id` | `transaction_id` |
| `DLV - value` | `value` |
| `DLV - currency` | `currency` |
| `DLV - contract_type` | `contract_type` |
| `DLV - order_number` | `order_number` |
| `DLV - step` | `step` |

> لـ `DLV - value` فعّل **Set Default Value** واتركه فارغاً (لا تضع 0).

---

## 3) المشغّلات (Triggers)

GTM ← **Triggers** ← **New** ← **Trigger Configuration** ← **Custom Event**:

| اسم المشغّل | Event name (حرفياً) | This trigger fires on |
|---|---|---|
| `CE - purchase` | `purchase` | All Custom Events |
| `CE - order_submitted` | `order_submitted` | All Custom Events |
| `CE - lessor_change_submitted` | `lessor_change_submitted` | All Custom Events |
| `CE - payment_started` | `payment_started` | All Custom Events |

> لا تفعّل **Use regex matching**. الاسم حساس لحالة الأحرف.

---

## 4) Google Ads — تحويل الشراء

### 4-أ) إنشاء إجراء التحويل في Google Ads
1. Google Ads ← **Goals** ← **Conversions** ← **Summary** ← **+ New conversion action**.
2. اختر **Website** ← اكتب `contractejar.com` ← **Scan**.
3. انزل إلى **Add a conversion action manually** (لا تستخدم «إنشاء تلقائي من الرابط»).
4. الحقول:
   - **Goal and action optimization:** `Purchase`
   - **Conversion name:** `شراء — عقد إيجار`
   - **Value:** اختر **Use different values for each conversion** ← Default value `349` ← العملة `SAR (Saudi Riyal)`
   - **Count:** `One` (طلب واحد = تحويل واحد)
   - **Click-through conversion window:** `30 days`
   - **Attribution:** `Data-driven`
5. **Done** ← **Save and continue**.
6. في شاشة **Set up the tag** اختر **Use Google Tag Manager** وانسخ:
   - **Conversion ID** (أرقام فقط، مثل `123456789`)
   - **Conversion Label** (نص مثل `AbC-D_efG-h12_34-567`)

> كرّر الخطوات لإجراء ثانٍ اختياري **«عميل محتمل»** بهدف `Submit lead form`، و**Count** = `One`، وقيمة بدون مبلغ (Don't use a value) — يُربط بـ `order_submitted`.

### 4-ب) الوسوم في GTM
1. **Conversion Linker** (مرة واحدة، إلزامي): Tags ← New ← **Conversion Linker** ← Trigger **All Pages**.
2. **Google Ads Conversion Tracking** للشراء: Tags ← New ← **Google Ads** ← **Google Ads Conversion Tracking**:
   - **Conversion ID:** القيمة المنسوخة
   - **Conversion Label:** القيمة المنسوخة
   - **Conversion Value:** `{{DLV - value}}`
   - **Transaction ID:** `{{DLV - transaction_id}}` ← يمنع العدّ المكرر
   - **Currency Code:** `{{DLV - currency}}`
   - **Triggering:** `CE - purchase`
3. (اختياري) وسم ثانٍ للعميل المحتمل بنفس النوع ← Conversion Label الثاني ← Triggering `CE - order_submitted` (بدون Value).
4. (اختياري) **Google Ads Remarketing** على All Pages للجماهير.

> تغيير المؤجر: يدخل تلقائياً في `purchase` بعد الدفع (`contract_type = lessor_change`). لو تبي تحويلاً منفصلاً له، أضف للمشغّل `CE - purchase` شرطاً: **Some Custom Events** ← `DLV - contract_type` **equals** `lessor_change`.

---

## 5) TikTok Pixel

### 5-أ) إنشاء البكسل في TikTok
1. TikTok Ads Manager ← **Tools** ← **Events** ← **Web Events** ← **Set up web events** (أو **Manage** ← **Connect data source**).
2. اختر **Web** ← اكتب `contractejar.com` ← طريقة الربط **Manual setup** ← **TikTok Pixel**.
3. اختر **Custom code / Google Tag Manager** وانسخ **Pixel ID** (يشبه `CABCDE1234567890`).

### 5-ب) الوسوم في GTM (القالب الرسمي)
1. Tags ← New ← **Tag Configuration** ← **Discover more tag types in the Community Template Gallery** ← ابحث `TikTok Pixel` (الناشر: **tiktok**) ← **Add to workspace**.
2. وسم الأساس (زيارات الصفحات):
   - **Pixel ID:** المنسوخ
   - **Event Type:** `Standard` ← **Event:** `Page View`
   - **Triggering:** `All Pages`
3. وسم الشراء:
   - **Pixel ID:** نفسه
   - **Event Type:** `Standard` ← **Event:** `Complete Payment` (في نسخ القالب الأحدث قد يظهر باسم `Purchase` — اختر أيّاً منهما، لا الاثنين)
   - **Parameters** (أو **Object Properties**):
     | Property | Value |
     |---|---|
     | `value` | `{{DLV - value}}` |
     | `currency` | `{{DLV - currency}}` |
     | `content_id` | `{{DLV - transaction_id}}` |
     | `content_type` | `product` |
     | `content_name` | `{{DLV - contract_type}}` |
   - **Event ID** (إن ظهر الحقل): `{{DLV - transaction_id}}` ← يمنع التكرار مع أي ربط خادم مستقبلي
   - **Triggering:** `CE - purchase`
4. (اختياري) **Submit Form** على `CE - order_submitted`، و**Contact** على مشغّل `cta_whatsapp_click`.

---

## 6) النشر والتحقق

1. GTM ← **Preview** ← أدخل `https://contractejar.com` ← سيفتح الموقع مع **Tag Assistant**.
2. مرّ على طلب حقيقي صغير (أو طلب تجريبي ثم استرجعه من اللوحة) حتى صفحة نجاح الدفع.
3. في Tag Assistant ← الحدث `purchase` ← تبويب **Tags Fired**: يجب أن ترى **Google Ads Conversion Tracking** و**TikTok Pixel – Complete Payment**.
4. تبويب **Variables** للحدث نفسه: `DLV - value` رقم، `DLV - currency` = `SAR`، `DLV - transaction_id` = رقم الطلب.
5. TikTok: إضافة Chrome **TikTok Pixel Helper** تعرض `CompletePayment` باللون الأخضر، وفي Ads Manager ← Events ← البكسل ← **Test Events**.
6. أخيراً GTM ← **Submit** ← Version name `ربط Google Ads + TikTok` ← **Publish**.
7. Google Ads ← Conversions: الحالة تتحوّل من **Unverified** إلى **Recording conversions** خلال 24–48 ساعة من أول تحويل.

## 7) مشاكل شائعة

| العرَض | السبب | الحل |
|---|---|---|
| الوسم يظهر «Fired» لكن لا تحويل | CSP حجب السكربت | افتح Console: رسالة `Refused to load the script` ← أضف النطاق في `next.config.ts` |
| تحويلات مكررة | Transaction ID فارغ | تأكد من `{{DLV - transaction_id}}` في الوسم |
| قيمة التحويل 0 | Default value = 0 في المتغير | اترك Default value فارغاً |
| لا شيء يُرسل إطلاقاً | `NEXT_PUBLIC_GTM_ID` غير مضبوط | اضبطه في Vercel ثم Redeploy |
| أحداث `wizard_*` بلا `purchase` | الدفع لم يكتمل/لم يتأكد من الخادم | `purchase` لا يُطلق إلا بعد تأكيد الخادم — هذا مقصود |
