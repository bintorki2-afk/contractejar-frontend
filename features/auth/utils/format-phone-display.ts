import { repairPhoneFromQueryParam } from "@/features/auth/utils/normalize-saudi-phone";

export function formatPhoneDisplay(phone: string | null | undefined) {
  // Social (Google/Apple) users have no mobile number, so this can be null —
  // return an empty string instead of crashing on `.replace` of null.
  if (!phone) {
    return "";
  }

  const repaired = repairPhoneFromQueryParam(phone) ?? phone;
  const digits = repaired.replace(/[٠-٩۰-۹]/g, (d) => "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹".indexOf(d) % 10 + "").replace(/\D/g, "");

  let localNumber: string | null = null;

  if (digits.startsWith("00966") && digits.length >= 14) {
    localNumber = digits.slice(5, 14);
  } else if (digits.startsWith("966") && digits.length >= 12) {
    localNumber = digits.slice(3, 12);
  } else if (repaired.startsWith("+966")) {
    localNumber = repaired.trim().replace(/\s/g, "").slice(4);
  } else if (/^\d{8}$/.test(digits)) {
    localNumber = `5${digits}`;
  }

  if (!localNumber || localNumber.length < 9) {
    return phone;
  }

  return `+966 ${localNumber.slice(0, 2)} ${localNumber.slice(2, 5)} ${localNumber.slice(5)}`;
}
