"use client";

import { useTranslations } from "next-intl";

import type { BirthDateValue } from "@/features/create-contract/types/owner-step";
import { convertToOtherCalendar, formatDateParts } from "@/lib/utils/hijri";

type CreateContractDateEquivalentHintProps = {
  value: BirthDateValue;
  className?: string;
};

/**
 * «الموافق …» — the OTHER calendar's equivalent of the typed date: a hijri
 * date shows its Gregorian match, a Gregorian date shows its Umm al-Qura match.
 */
export default function CreateContractDateEquivalentHint({
  value,
  className,
}: CreateContractDateEquivalentHintProps) {
  const t = useTranslations("createContract.dateHelper");
  const converted = convertToOtherCalendar(value);

  if (!converted) {
    return null;
  }

  const text =
    converted.calendar === "hijri"
      ? t("correspondingHijri", { date: formatDateParts(converted) })
      : t("correspondingGregorian", { date: formatDateParts(converted) });

  return (
    <p className={className ?? "text-xs text-[#9a9a9a] dark:text-[#9eb5af]"}>
      {text}
      {converted.approximate ? ` (${t("approximate")})` : ""}
    </p>
  );
}
