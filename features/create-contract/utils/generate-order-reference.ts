/**
 * Generate a customer-facing order reference: a 6-digit number (100000–999999).
 * Shown from the first step of a fresh (account-less) order and reused in the
 * success screen and the Telegram order payload, so the customer and support
 * always see the same number.
 */
export function generateOrderReference(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
