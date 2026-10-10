/**
 * One date/time format for every customer-facing timestamp on the site:
 * Gregorian calendar, Latin digits, Riyadh time (fixed so server and browser
 * render the same string). Hijri-only output confused customers trying to
 * match a notification with an order event (QA WEB-3).
 *
 * The output contains Arabic words and RLM marks, so render it in the page's
 * RTL flow — never inside `dir="ltr"` (QA WEB-4 garbled the day/«ص» order).
 */
const DATE_TIME = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Riyadh",
});

const DATE_ONLY = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
  dateStyle: "medium",
  timeZone: "Asia/Riyadh",
});

function toDate(value: string | number | Date | null | undefined): Date | null {
  if (value == null || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatArDateTime(value: string | number | Date | null | undefined): string {
  const date = toDate(value);
  return date ? DATE_TIME.format(date) : "";
}

export function formatArDate(value: string | number | Date | null | undefined): string {
  const date = toDate(value);
  return date ? DATE_ONLY.format(date) : "";
}
