# أحداث التحويل (GTM dataLayer) — موقع «عقد إيجار»

> المصدر في الكود: `lib/analytics/track.ts` (الدالة `track(event, params)`).
> كل حدث يُدفع إلى `window.dataLayer` بالشكل `{ event: "<الاسم>", ...المعاملات }`.
> بدون `NEXT_PUBLIC_GTM_ID` لا يُرسل شيء (الدالة لا تفعل شيئاً).

## قائمة الأحداث

| الحدث | متى يُطلق | المعاملات | الاستخدام المقترح في GTM |
|---|---|---|---|
| `wizard_start` | ضغط «ابدأ» في الخطوة التعريفية للمعالج | `contract_type` (`housing` / `commercial`) | قياس بداية التحويل (Funnel top) |
| `wizard_step` | الوصول لكل خطوة في المعالج (مرة واحدة لكل خطوة في الجلسة) | `contract_type`، `step` = `1` الصك، `2` العنوان الوطني، `3` المالك، `4` المستأجر، `5` الوحدة، `6` البيانات المالية، `"review"` المراجعة | تقرير التسرّب بين الخطوات (الخطوة 2 تُرسل عند الانتقال من شاشة الصك للمالك لأن العنوان الوطني صار في شاشة الصك نفسها) |
| `order_submitted` | نجاح «إرسال الطلب» (الطلب أصبح على الخادم، قبل الدفع) | `order_number`، `contract_type` | تحويل «عميل محتمل» (Lead) |
| `payment_started` | الانتقال إلى بوابة ميسر | `order_number`، `value` (المبلغ بالريال) | بدء الدفع (Begin checkout) |
| `purchase` | شاشة نجاح الدفع بعد تأكيد الخادم — **مرة واحدة لكل طلب** (حارس `sessionStorage`) | `transaction_id` = رقم الطلب، `value`، `currency: "SAR"`، `contract_type` (`housing` / `commercial` / `lessor_change`) | **تحويل الشراء الرئيسي** لـ Google Ads / Snap / TikTok |
| `lessor_change_submitted` | نجاح إرسال طلب تغيير المؤجر | `order_number`، `value` | تحويل خدمة تغيير المؤجر |
| `cta_whatsapp_click` | ضغط أي زر واتساب | `placement` (`hero_floating`، `support_section`، `support_page`، `order_detail`، `order_success`، `payment_success`، `payment_error`) | تحويل «تواصل» |
| `otp_requested` | طلب رمز تحقق | `context` (`login` / `checkout`) | تشخيص فقط |
| `otp_verified` | نجاح التحقق من الرمز | `context` | تشخيص / إنشاء حساب |
| `generate_lead` | (قديم — يبقى للتوافق) إرسال إشعار الطلب لقناة الأعمال | `order_number`، `contract_type`، `currency`، `value` (من `NEXT_PUBLIC_LEAD_VALUE`) | الوسوم المضبوطة سابقاً على هذا الحدث تستمر |

## ضبط الوسوم في GTM (خطوات مختصرة)

1. **المتغيرات (Variables):** أنشئ متغيرات من نوع *Data Layer Variable* بالأسماء: `order_number`، `contract_type`، `value`، `transaction_id`، `currency`، `step`، `placement`.
2. **المشغّلات (Triggers):** لكل حدث أنشئ مشغّل *Custom Event* باسم الحدث حرفياً (مثل `purchase`).
3. **Google Ads — Conversion Tracking:**
   - الشراء: وسم Google Ads Conversion على مشغّل `purchase`، واملأ *Conversion Value* بـ `{{value}}` و*Currency Code* بـ `{{currency}}` و*Transaction ID* بـ `{{transaction_id}}` (يمنع تكرار العدّ).
   - العميل المحتمل: وسم آخر على `order_submitted` (أو `generate_lead`).
4. **GA4:** وسم GA4 Event باسم `purchase` مع المعاملات نفسها (GA4 يعتبر `purchase` حدث تجارة إلكترونية؛ يمكن إضافة `items` لاحقاً إن لزم).
5. **Snap Pixel:** وسم Custom HTML على `purchase`: `snaptr('track','PURCHASE',{price: {{value}}, currency: 'SAR', transaction_id: '{{transaction_id}}'})`، وعلى `order_submitted`: `snaptr('track','SIGN_UP')` أو `START_CHECKOUT` على `payment_started`.
6. **TikTok Pixel:** `ttq.track('CompletePayment',{value: {{value}}, currency:'SAR', content_id:'{{transaction_id}}'})` على `purchase`، و`ttq.track('SubmitForm')` على `order_submitted`، و`ttq.track('Contact')` على `cta_whatsapp_click`.
7. **Meta / X:** بنفس المنطق (`Purchase` / `Lead` / `Contact`).

## ملاحظات

- **تحقّق فعلي (فحص 2026-10-08، Playwright مع GTM تجريبي):** الترتيب المسجّل في dataLayer لرحلة كاملة: `wizard_start` ← `wizard_step` 1..6 ← `review` ← `otp_requested` ← `otp_verified` ← `order_submitted` ← `payment_started` (value من الخادم) ← (بوابة ميسر) ← `purchase` مرة واحدة (لا يتكرر بعد تحديث الصفحة)، و`lessor_change_submitted` بقيمة 400.

- التحويلات تُرسل من المتصفح فقط؛ لا توجد تحويلات من الخادم (Server-side) حالياً.
- `purchase` يعتمد على تأكيد الخادم لحالة الدفع (`GET /status/success/{uuid}`) وليس على معاملات الرابط، فلا يُطلق عند فشل الدفع.
- إشعار الكوكيز يظهر فقط عند ضبط `NEXT_PUBLIC_GTM_ID`، وموافقة Consent Mode الافتراضية «granted» (انظر `features/analytics/components/gtm-scripts.tsx`).
- للاختبار: افتح الموقع مع `?gtm_debug=x` أو استخدم Tag Assistant، ثم مرّ على المعالج حتى نجاح الدفع وراقب الأحداث في Data Layer.
