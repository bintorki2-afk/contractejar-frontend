import { digitsOnly } from "@/lib/utils/digits";

export const SAUDI_MOBILE_PREFIX = "05";
export const SAUDI_MOBILE_SUBSCRIBER_LENGTH = 8;
export const SAUDI_MOBILE_LENGTH = 10;

/**
 * Normalize any phone input to 05xxxxxxxx, live as the user types.
 * Collapses a duplicated/pasted 05 prefix (e.g. 0505...0501234567 → 0501234567) but only once
 * there are more digits than a real number can hold, so a legitimate subscriber that happens to
 * start with 05 (e.g. 0505123456) is preserved instead of being stripped.
 * Forces the result to start with 05 otherwise (e.g. 5xxxxxxxx → 05xxxxxxxx).
 */
export function toSaudiMobileInputValue(raw: string) {
  let digits = digitsOnly(raw);

  if (!digits) {
    return "";
  }

  if (digits.startsWith("00966")) {
    digits = digits.slice(5);
  } else if (digits.startsWith("966")) {
    digits = digits.slice(3);
  }

  // Still typing a valid partial "05" prefix - don't force anything onto it yet.
  if (digits === "0") {
    return digits;
  }

  // Started with 0 but the second digit isn't 5 (typo, e.g. "09...") - fix that digit to 5
  // instead of shoving an extra "05" in front of what was typed.
  if (digits[0] === "0" && digits[1] !== "5") {
    digits = `05${digits.slice(2)}`;
  }

  while (digits.length > SAUDI_MOBILE_LENGTH && digits.startsWith("0505")) {
    digits = `05${digits.slice(4)}`;
  }

  if (digits.startsWith(SAUDI_MOBILE_PREFIX)) {
    const subscriber = digits.slice(SAUDI_MOBILE_PREFIX.length);
    return `${SAUDI_MOBILE_PREFIX}${subscriber.slice(0, SAUDI_MOBILE_SUBSCRIBER_LENGTH)}`;
  }

  // National form without a leading 0: 5xxxxxxxx → 05xxxxxxxx
  if (digits.startsWith("5")) {
    return `${SAUDI_MOBILE_PREFIX}${digits.slice(1, 1 + SAUDI_MOBILE_SUBSCRIBER_LENGTH)}`;
  }

  return `${SAUDI_MOBILE_PREFIX}${digits.slice(0, SAUDI_MOBILE_SUBSCRIBER_LENGTH)}`;
}

/** Format API phone values for create-flow inputs as 05xxxxxxxx. */
export function formatSaudiMobileForForm(phone: string | null | undefined) {
  if (!phone) {
    return "";
  }

  return toSaudiMobileInputValue(phone);
}

export function isSaudiMobilePrefixOnly(phone: string) {
  const digits = digitsOnly(phone);
  return digits.length === 0 || digits === SAUDI_MOBILE_PREFIX;
}
