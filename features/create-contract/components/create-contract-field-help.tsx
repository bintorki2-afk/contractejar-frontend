import type { ReactNode } from "react";
import {
  Info,
  MapPin,
  Share2,
  ClipboardPaste,
  User,
  UserCheck,
  Users,
  Building2,
  ShieldCheck,
} from "lucide-react";

/**
 * Rich, customer-friendly explanations shown inside the field-label popover.
 * Each export is passed to <CreateContractFieldLabel help={...} /> for a field.
 */

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div dir="rtl" className="text-right">
      <div className="flex items-center gap-2 bg-linear-to-l from-[#0d5a50] to-[#0d6a5c] px-4 py-3 text-white">
        <Info className="size-4 shrink-0" aria-hidden="true" />
        <span className="text-sm font-bold">{title}</span>
      </div>
      <div className="space-y-3 p-4">{children}</div>
    </div>
  );
}

function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="text-[13px] leading-relaxed text-[#33463f]">{children}</p>
  );
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2.5">
      {items.map((s, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
            {i + 1}
          </span>
          <span className="text-[13px] leading-relaxed text-[#33463f]">{s}</span>
        </li>
      ))}
    </ol>
  );
}

function Option({
  icon,
  title,
  desc,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-[#eef3f1] p-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
        {icon}
      </span>
      <span>
        <span className="block text-[13px] font-bold text-[#12251f]">{title}</span>
        <span className="block text-[11.5px] leading-snug text-[#6b7c76]">{desc}</span>
      </span>
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-lg bg-[#e9f7f1] px-3 py-2 text-[12px] leading-relaxed text-[#2c4a42]">
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function NationalAddressLinkHelp() {
  return (
    <Shell title="كيف أحصل على رابط العنوان الوطني؟">
      <Steps
        items={[
          "افتح خرائط قوقل وابحث عن موقع العقار بدقّة.",
          "اضغط «مشاركة» ثم «نسخ الرابط».",
          "الصق الرابط في الحقل بالأعلى.",
        ]}
      />
      <div className="flex items-center justify-center gap-3 rounded-xl bg-[#f4f8f6] p-3 text-[11px] font-semibold text-[#5b6f68]">
        <span className="flex flex-col items-center gap-1">
          <MapPin className="size-5 text-[#ea4335]" aria-hidden="true" />
          ابحث
        </span>
        <span aria-hidden="true">‹</span>
        <span className="flex flex-col items-center gap-1">
          <Share2 className="size-5 text-brand" aria-hidden="true" />
          مشاركة
        </span>
        <span aria-hidden="true">‹</span>
        <span className="flex flex-col items-center gap-1">
          <ClipboardPaste className="size-5 text-brand" aria-hidden="true" />
          الصق
        </span>
      </div>
      <p className="rounded-lg bg-[#f4f8f6] px-3 py-2 text-[12px] text-[#6b7c76]">
        يقبل روابط: <b className="text-brand">maps.app.goo.gl</b> أو{" "}
        <b className="text-brand">google.com/maps</b>
      </p>
    </Shell>
  );
}

export function DocFeeHelp() {
  return (
    <Shell title="وش هي رسوم توثيق العقد؟">
      <Lead>
        رسوم <b className="text-brand">رسمية</b> تُدفع <b className="text-brand">مرّة واحدة</b>{" "}
        عند إصدار عقدك وتوثيقه عبر منصة إيجار — تشمل إصدار العقد الموثّق وحفظ حقوق الطرفين.
      </Lead>
      <div className="rounded-xl bg-[#f4f8f6] p-3 text-[12.5px] text-[#33463f]">
        تشمل: رسوم توثيق إيجار + ضريبة القيمة المضافة (١٥٪).
      </div>
      <Note>يظهر المبلغ الإجمالي كاملاً قبل الدفع — لا توجد رسوم خفية.</Note>
    </Shell>
  );
}

export function InstallmentsHelp() {
  return (
    <Shell title="كيف تُقسّم الدفعات؟">
      <Lead>
        قيمة الإيجار السنوي تُقسّم على عدد الدفعات اللي تختارها (سنوية، نصف سنوية، ربع
        سنوية، شهرية)، وكل دفعة تُدفع في بداية فترتها.
      </Lead>
      <div className="rounded-xl bg-[#f4f8f6] p-3 text-[12.5px] text-[#33463f]">
        <b>مثال:</b> إيجار سنوي <b className="text-brand">١٢٬٠٠٠ ﷼</b> على ٤ دفعات ={" "}
        <b className="text-brand">٣٬٠٠٠ ﷼</b> كل ٣ أشهر.
      </div>
      <Note>تقدر تغيّر عدد الدفعات قبل إصدار العقد.</Note>
    </Shell>
  );
}

export function DurationRenewalHelp() {
  return (
    <Shell title="مدة العقد والتجديد التلقائي">
      <Lead>
        تحدّد مدة العقد (مثلاً سنة). عند انتهائها <b className="text-brand">يتجدّد العقد
        تلقائياً</b> بنفس الشروط، ما لم يُشعر أحد الطرفين الآخر برغبته في عدم التجديد قبل
        نهاية المدة.
      </Lead>
      <Note>تقدر توقف التجديد التلقائي بإشعار الطرف الآخر قبل نهاية المدة.</Note>
    </Shell>
  );
}

export function LessorCapacityHelp() {
  return (
    <Shell title="أي صفة أختار؟">
      <Option
        icon={<User className="size-5" aria-hidden="true" />}
        title="مالك"
        desc="أنت صاحب العقار وتوثّق العقد باسمك مباشرة."
      />
      <Option
        icon={<UserCheck className="size-5" aria-hidden="true" />}
        title="وكيل"
        desc="توثّق نيابةً عن المالك بموجب وكالة سارية."
      />
      <Option
        icon={<Users className="size-5" aria-hidden="true" />}
        title="ورثة"
        desc="العقار ضمن تركة، وتوثّق نيابةً عن الورثة (يلزم صك حصر الورثة أو وكالة)."
      />
    </Shell>
  );
}

export function UnifiedRecordHelp() {
  return (
    <Shell title="وين ألقى رقم السجل الموحّد؟">
      <Lead>
        رقم موحّد للمنشأة يبدأ عادةً بـ<b className="text-brand">٧٠٠</b>. تلقاه في شهادة
        السجل التجاري، أو عبر منصة/تطبيق <b className="text-brand">المركز السعودي للأعمال</b>.
      </Lead>
      <Note>لو المؤجر/المستأجر فرد، استخدم رقم الهوية/الإقامة بدل السجل.</Note>
    </Shell>
  );
}

export function DelegationHelp() {
  return (
    <Shell title="متى أحتاج تفويض أو وكالة؟">
      <Lead>
        تحتاج تفويضاً ساري المفعول فقط إذا كنت توثّق العقد <b className="text-brand">نيابةً
        عن غيرك</b> (مالك، منشأة، أو ورثة) — واختر نوعه حسب مصدره:
      </Lead>
      <Option
        icon={<UserCheck className="size-5" aria-hidden="true" />}
        title="وكالة شرعية (ناجز)"
        desc="صادرة من كتابة العدل / ناجز."
      />
      <Option
        icon={<Building2 className="size-5" aria-hidden="true" />}
        title="تفويض منشأة"
        desc="مفوّض عن شركة عبر السجل التجاري."
      />
      <Note>إذا توثّق العقد باسمك مباشرة — ما تحتاج أي تفويض.</Note>
    </Shell>
  );
}

export function TenantTypeHelp() {
  return (
    <Shell title="فرد أو منشأة؟">
      <Option
        icon={<User className="size-5" aria-hidden="true" />}
        title="فرد"
        desc="المستأجر شخص — يُطلب رقم الهوية أو الإقامة."
      />
      <Option
        icon={<Building2 className="size-5" aria-hidden="true" />}
        title="منشأة"
        desc="المستأجر جهة/شركة — يُطلب رقم السجل الموحّد/التجاري."
      />
    </Shell>
  );
}
