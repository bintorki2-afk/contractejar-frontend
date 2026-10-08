import { digitsOnly } from "@/lib/utils/digits";

export const UNIFIED_RECORD_NUMBER_PREFIX = "7";
export const UNIFIED_RECORD_NUMBER_SUBSCRIBER_LENGTH = 9;
export const UNIFIED_RECORD_NUMBER_LENGTH = 10;

/**
 * Normalize unified record number input to 7xxxxxxxxx (10 digits).
 */
export function toUnifiedRecordNumberInputValue(raw: string) {
  let digits = digitsOnly(raw);

  if (!digits || digits === UNIFIED_RECORD_NUMBER_PREFIX) {
    return UNIFIED_RECORD_NUMBER_PREFIX;
  }

  while (digits.startsWith("77")) {
    digits = digits.slice(1);
  }

  if (!digits.startsWith(UNIFIED_RECORD_NUMBER_PREFIX)) {
    digits = `${UNIFIED_RECORD_NUMBER_PREFIX}${digits}`;
  }

  return `${UNIFIED_RECORD_NUMBER_PREFIX}${digits.slice(1, 1 + UNIFIED_RECORD_NUMBER_SUBSCRIBER_LENGTH)}`;
}

/** Format API values for create-flow inputs as 7xxxxxxxxx. */
export function formatUnifiedRecordNumberForForm(
  value: string | null | undefined,
) {
  if (!value) {
    return UNIFIED_RECORD_NUMBER_PREFIX;
  }

  return toUnifiedRecordNumberInputValue(value);
}

/** Editable digits after the fixed 7 prefix. */
export function getUnifiedRecordNumberSubscriber(value: string) {
  const full = toUnifiedRecordNumberInputValue(value);
  return full.startsWith(UNIFIED_RECORD_NUMBER_PREFIX)
    ? full.slice(UNIFIED_RECORD_NUMBER_PREFIX.length)
    : full;
}

export function isUnifiedRecordNumberPrefixOnly(value: string) {
  const digits = digitsOnly(value);
  return digits.length === 0 || digits === UNIFIED_RECORD_NUMBER_PREFIX;
}
