/**
 * The real order number is the backend uuid — a short numeric value (6 digits,
 * e.g. 620785). Before the backend assigns it, a fresh contract session uses a
 * placeholder (a Date.now() timestamp / a random hex UUID) that must never be
 * shown to the customer. This guards the display so only the real, numeric
 * order number appears.
 */
export function isDisplayableOrderNumber(value: unknown): boolean {
  if (value == null) return false;
  return /^\d{4,7}$/.test(String(value).trim());
}
