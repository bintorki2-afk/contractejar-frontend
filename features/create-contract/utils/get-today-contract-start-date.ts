import type {
  BirthDateValue,
  CalendarType,
} from "@/features/create-contract/types/owner-step";

function padDatePart(value: string | number) {
  return String(value).replace(/[٠-٩۰-۹]/g, (d) => "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹".indexOf(d) % 10 + "").replace(/\D/g, "").padStart(2, "0");
}

function getGregorianTodayParts() {
  const now = new Date();

  return {
    day: padDatePart(now.getDate()),
    month: padDatePart(now.getMonth() + 1),
    year: String(now.getFullYear()),
  };
}

function getHijriTodayParts() {
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).formatToParts(new Date());

    const day = parts.find((part) => part.type === "day")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const year = parts.find((part) => part.type === "year")?.value;

    if (day && month && year) {
      return {
        day: padDatePart(day),
        month: padDatePart(month),
        year: year.replace(/[٠-٩۰-۹]/g, (d) => "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹".indexOf(d) % 10 + "").replace(/\D/g, ""),
      };
    }
  } catch {
    // Fallback below.
  }

  const gregorian = getGregorianTodayParts();
  return {
    ...gregorian,
    year: String(Number(gregorian.year) - 579),
  };
}

export function getTodayContractStartDate(
  calendarType: CalendarType = "gregorian",
): BirthDateValue {
  const parts =
    calendarType === "hijri" ? getHijriTodayParts() : getGregorianTodayParts();

  return {
    calendarType,
    day: parts.day,
    month: parts.month,
    year: parts.year,
  };
}
