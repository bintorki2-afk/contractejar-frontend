# التتبع الإعلاني والتحليلات (Google Tag Manager)

هذا الدليل يشرح كيف تربط منصات الإعلانات والتحليلات بالموقع **دون أي تعديل برمجي**.
الفكرة باختصار: نُركّب حاوية واحدة من Google Tag Manager (GTM)، ثم نضيف كل البكسلات
(Google Ads، GA4، Meta، TikTok، X، Snap) من داخل واجهة GTM نفسها.

---

## 1) التفعيل (خطوة واحدة في الكود)

1. أنشئ حاوية واحدة في [Google Tag Manager](https://tagmanager.google.com) — احصل على المعرّف بصيغة `GTM-XXXXXXX`.
2. أضِف المتغيّر التالي في بيئة التشغيل (Vercel → Settings → Environment Variables، أو ملف `.env.local` محليًا):

   ```
   NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
   ```

3. (اختياري) قيمة تحويل ثابتة لكل طلب بالريال السعودي:

   ```
   NEXT_PUBLIC_LEAD_VALUE=249
   ```

4. أعِد النشر (Redeploy). المتغيّرات تُدمج في الحزمة وقت البناء، فلا بد من إعادة النشر بعد أي تغيير.

> إذا تُرك `NEXT_PUBLIC_GTM_ID` فارغًا، يتعطّل كل شيء تلقائيًا: لا تُحمّل أي سكربتات،
> ولا يظهر إشعار الكوكيز، ولا يُرسل أي حدث. لا حاجة لأي تعديل آخر.

عند التفعيل يتولّى الموقع تلقائيًا:

- تحميل GTM في كل الصفحات.
- ضبط **وضع الموافقة (Consent Mode)** بالقيمة `granted` افتراضيًا (التقاط كامل للبيانات).
- عرض **إشعار كوكيز** بسيط قابل للإغلاق (باللغة العربية، متوافق مع نظام حماية البيانات).

---

## 2) إضافة البكسلات (كلها داخل واجهة GTM — بدون كود)

من داخل حاوية GTM، أضِف كل منصة كـ Tag واربطها بالحدث `generate_lead` كتحويل:

| المنصة        | نوع الوسم (Tag) في GTM                          |
| ------------- | ---------------------------------------------- |
| GA4           | Google Analytics: GA4 Configuration + Event    |
| Google Ads    | Google Ads Conversion Tracking / Remarketing   |
| Meta (Facebook) | من قوالب المجتمع: "Meta Pixel"               |
| TikTok        | من قوالب المجتمع: "TikTok Pixel"               |
| X (Twitter)   | من قوالب المجتمع: "X / Twitter Pixel"          |
| Snapchat      | من قوالب المجتمع: "Snap Pixel"                 |

خطوات ربط التحويل لأي منصة:

1. أنشئ **Trigger** من نوع **Custom Event** واجعل اسم الحدث بالضبط: `generate_lead`.
2. أنشئ **Tag** للمنصة المطلوبة، واربطه بذلك الـ Trigger.
3. استخدم متغيّرات dataLayer (انظر الجدول أدناه) لتمرير رقم الطلب أو قيمة التحويل عند الحاجة.
4. اختبر عبر **Preview** ثم **Submit / Publish**.

---

## 3) حدث التحويل الذي يرسله الموقع

> **تحديث 2026-10-08:** صار للموقع مجموعة أحداث تحويل كاملة (`wizard_start`، `wizard_step`، `order_submitted`، `payment_started`، **`purchase`**، `lessor_change_submitted`، `cta_whatsapp_click`، `otp_requested`، `otp_verified`) موثّقة في **`docs/analytics-events.md`**. استخدم `purchase` لتحويل الشراء، ويبقى `generate_lead` أدناه للتوافق مع الوسوم القديمة.

عند إرسال أي طلب بنجاح، يدفع الموقع الحدث التالي إلى `dataLayer`:

| الحقل            | المعنى                                   | مثال              |
| ---------------- | ---------------------------------------- | ----------------- |
| `event`          | اسم الحدث (استخدمه كمشغّل التحويل)         | `generate_lead`   |
| `order_number`   | رقم الطلب                                 | `AQ-260925-1234`  |
| `contract_type`  | نوع العقد                                 | `سكني` / `تجاري`  |
| `currency`       | العملة                                    | `SAR`             |
| `value`          | قيمة التحويل (تظهر فقط عند ضبط `NEXT_PUBLIC_LEAD_VALUE`) | `249`  |

مثال على ما يظهر في `dataLayer`:

```js
{
  event: "generate_lead",
  order_number: "AQ-260925-1234",
  contract_type: "سكني",
  currency: "SAR",
  value: 249
}
```

استخدم `generate_lead` كـ **حدث التحويل (Conversion)** في كل منصة، ويمكنك ربط
`value` و`currency` كقيمة التحويل و`order_number` كمعرّف للطلب لمنع التكرار.

---

## 4) الخصوصية والموافقة

- وضع الموافقة مضبوط افتراضيًا على `granted` لالتقاط كامل للبيانات.
- للانتقال إلى نموذج "الموافقة أولًا" لاحقًا: غيّر القيم إلى `denied` في
  `features/analytics/components/gtm-scripts.tsx`، ثم استدعِ
  `gtag('consent','update', {...})` من زر القبول في إشعار الكوكيز.
- يُحفظ إغلاق الإشعار في المتصفح تحت المفتاح `aqdi-cookie-consent`.
