import { digitsOnly } from "@/lib/utils/digits";

/**
 * Saudi identity numbers are 10 digits: 1… citizen ID, 2… resident (iqama).
 * A property owner (or a new owner in «تغيير المؤجر») may also be an
 * establishment with a 700 unified number (7…).
 */
export function isValidPersonId(value: string): boolean {
  return /^[12]\d{9}$/.test(digitsOnly(value));
}

export function isValidOwnerId(value: string): boolean {
  return /^[127]\d{9}$/.test(digitsOnly(value));
}
