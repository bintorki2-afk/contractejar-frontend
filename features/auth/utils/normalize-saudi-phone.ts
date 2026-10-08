import { digitsOnly } from "@/lib/utils/digits";

export function normalizeSaudiPhone(phone: string): string {
  return phone.trim().replace(/\s/g, "");
}

/** 9-digit Saudi national mobile, e.g. 512345678 */
export function getSaudiNationalMobile(phone: string): string | null {
  const digits = digitsOnly(phone.trim().replace(/\s/g, ""));

  if (!digits) {
    return null;
  }

  let national = digits;

  if (national.startsWith("00966") && national.length >= 14) {
    national = national.slice(5, 14);
  } else if (national.startsWith("966") && national.length >= 12) {
    national = national.slice(3, 12);
  } else if (national.startsWith("0") && national.length === 10) {
    national = national.slice(1);
  } else if (/^\d{8}$/.test(national)) {
    national = `5${national}`;
  }

  return /^5\d{8}$/.test(national) ? national : null;
}

/** API mobile with Saudi country code: 00966512345678 */
export function getSaudiMobileForApi(phone: string): string {
  const national = getSaudiNationalMobile(phone);

  if (national) {
    return `00966${national}`;
  }

  return normalizeSaudiPhone(phone);
}

export function repairPhoneFromQueryParam(phone?: string): string | undefined {
  if (!phone) {
    return undefined;
  }

  const national = getSaudiNationalMobile(phone);

  if (national) {
    return `00966${national}`;
  }

  const normalized = normalizeSaudiPhone(phone);
  return normalized || undefined;
}
