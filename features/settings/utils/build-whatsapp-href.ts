export function buildWhatsappHref(
  contactNumber: string | null | undefined,
  fallback = "https://wa.me/",
) {
  const raw = typeof contactNumber === "string" ? contactNumber.trim() : "";
  if (!raw) {
    return fallback;
  }

  const digits = raw.replace(/[٠-٩۰-۹]/g, (d) => "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹".indexOf(d) % 10 + "").replace(/\D/g, "");
  if (!digits) {
    return fallback;
  }

  const normalized = digits.startsWith("966")
    ? digits
    : digits.startsWith("0")
      ? `966${digits.slice(1)}`
      : `966${digits}`;

  return `https://wa.me/${normalized}`;
}

// رقم دعم «عقدي» (0597500014) — القيمة الاحتياطية الوحيدة في الكود (قاعدة ف18).
// المصدر الفعلي هو إعدادات الخادم (`whatsapp_contact` / `whatsapp` / `support_phone`
// من GET /settings)؛ تُستخدم هذه القيمة فقط عند غياب الإعداد أو بقاء العيّنة التجريبية.
export const DEFAULT_CONTACT_NUMBER = "966597500014";
const PLACEHOLDER_CONTACT_NUMBER = "966501234567";

function normalizeContactDigits(value: string) {
  const digits = value
    .replace(/[٠-٩۰-۹]/g, (d) => (("٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹".indexOf(d) % 10) + ""))
    .replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("966")) return digits;
  if (digits.startsWith("0")) return `966${digits.slice(1)}`;
  return `966${digits}`;
}

export function resolveSettingsWhatsappNumber(
  settings:
    | {
        whatsapp_contact?: string | null;
        whatsapp?: string | null;
        support_phone?: string | null;
      }
    | null
    | undefined,
) {
  const raw =
    settings?.whatsapp_contact?.trim() ||
    settings?.whatsapp?.trim() ||
    settings?.support_phone?.trim() ||
    "";
  const normalized = normalizeContactDigits(raw);

  // Empty or the demo placeholder → fall back to the real number.
  if (!normalized || normalized === PLACEHOLDER_CONTACT_NUMBER) {
    return DEFAULT_CONTACT_NUMBER;
  }

  return raw;
}
