/**
 * Umm al-Qura ⇄ Gregorian conversion for the «الموافق …» helper lines.
 *
 * Gregorian → Hijri uses the browser's `islamic-umalqura` calendar (exact).
 * Hijri → Gregorian starts from the tabular (arithmetic) Islamic calendar and
 * then snaps to the exact Umm al-Qura day by checking the candidates around it
 * with `Intl`; when `Intl` has no Umm al-Qura support the tabular result is
 * returned and flagged `approximate` (±1 day).
 */

import { digitsOnly } from "@/lib/utils/digits";

export type CalendarKind = "hijri" | "gregorian";

export type DateParts = {
  year: number;
  month: number;
  day: number;
};

export type ConvertedDate = DateParts & {
  calendar: CalendarKind;
  approximate: boolean;
};

const UMALQURA_FORMATTER = (() => {
  try {
    return new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return null;
  }
})();

function toParts(value: {
  year: string | number;
  month: string | number;
  day: string | number;
}): DateParts | null {
  const year = Number(digitsOnly(String(value.year)));
  const month = Number(digitsOnly(String(value.month)));
  const day = Number(digitsOnly(String(value.day)));

  if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  return { year, month, day };
}

/** Exact Umm al-Qura parts of a (UTC) Gregorian date, or null without Intl support. */
export function gregorianToHijri(date: Date): DateParts | null {
  if (!UMALQURA_FORMATTER || Number.isNaN(date.getTime())) {
    return null;
  }

  try {
    const parts = UMALQURA_FORMATTER.formatToParts(date);
    const read = (type: Intl.DateTimeFormatPartTypes) =>
      Number(digitsOnly(parts.find((part) => part.type === type)?.value ?? ""));
    const year = read("year");
    const month = read("month");
    const day = read("day");

    if (!year || !month || !day) {
      return null;
    }

    return { year, month, day };
  } catch {
    return null;
  }
}

/** Julian day number of a tabular Islamic date (civil epoch 1948440). */
function tabularHijriToJulianDay({ year, month, day }: DateParts): number {
  return (
    Math.floor((11 * year + 3) / 30) +
    354 * year +
    30 * month -
    Math.floor((month - 1) / 2) +
    day +
    1948440 -
    385
  );
}

function julianDayToDate(julianDay: number): Date {
  // Unix epoch is JD 2440587.5; our JDs are integers at noon → subtract 2440588.
  return new Date((julianDay - 2440588) * 86_400_000);
}

function sameParts(a: DateParts | null, b: DateParts): boolean {
  return a !== null && a.year === b.year && a.month === b.month && a.day === b.day;
}

/**
 * Gregorian (UTC midnight) date of an Umm al-Qura hijri date. Exact when the
 * browser supports the calendar, otherwise tabular (`approximate: true`).
 */
export function hijriToGregorian(
  hijri: DateParts,
): { date: Date; approximate: boolean } | null {
  if (hijri.month < 1 || hijri.month > 12 || hijri.day < 1 || hijri.day > 30) {
    return null;
  }

  const base = julianDayToDate(tabularHijriToJulianDay(hijri));

  if (Number.isNaN(base.getTime())) {
    return null;
  }

  if (UMALQURA_FORMATTER) {
    // Tabular and Umm al-Qura never drift more than a couple of days apart.
    for (const offset of [0, -1, 1, -2, 2, -3, 3]) {
      const candidate = new Date(base.getTime() + offset * 86_400_000);
      if (sameParts(gregorianToHijri(candidate), hijri)) {
        return { date: candidate, approximate: false };
      }
    }
  }

  return { date: base, approximate: true };
}

/**
 * The "other" calendar's equivalent of a date typed in the wizard — what the
 * «الموافق …» line shows. Returns null while the date is incomplete/invalid.
 */
export function convertToOtherCalendar(value: {
  calendarType: CalendarKind;
  year: string | number;
  month: string | number;
  day: string | number;
}): ConvertedDate | null {
  const parts = toParts(value);
  if (!parts) {
    return null;
  }

  if (value.calendarType === "gregorian") {
    const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
    // Reject rolled-over dates such as 31/02.
    if (
      date.getUTCFullYear() !== parts.year ||
      date.getUTCMonth() !== parts.month - 1 ||
      date.getUTCDate() !== parts.day
    ) {
      return null;
    }

    const hijri = gregorianToHijri(date);
    return hijri ? { ...hijri, calendar: "hijri", approximate: false } : null;
  }

  const gregorian = hijriToGregorian(parts);
  if (!gregorian) {
    return null;
  }

  return {
    year: gregorian.date.getUTCFullYear(),
    month: gregorian.date.getUTCMonth() + 1,
    day: gregorian.date.getUTCDate(),
    calendar: "gregorian",
    approximate: gregorian.approximate,
  };
}

/** `d/m/yyyy` with ASCII digits, the format used across the wizard. */
export function formatDateParts(parts: DateParts): string {
  return `${parts.day}/${parts.month}/${parts.year}`;
}
