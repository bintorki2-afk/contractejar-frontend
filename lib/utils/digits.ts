/**
 * Digit normalization shared by every numeric input in the site.
 *
 * Arabic keyboards type Arabic-Indic (٠-٩) or Eastern Arabic-Indic (۰-۹)
 * digits; the backend and every validator expect ASCII digits. These helpers
 * convert on input so a user never has to switch keyboards.
 */

const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const EASTERN_ARABIC_INDIC_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const FULLWIDTH_DIGITS = "０１２３４５６７８９";

const NON_ASCII_DIGIT_RE = /[٠-٩۰-۹０-９]/g;

/** Invisible directional marks an RTL keyboard may insert around `+`/digits. */
const DIRECTIONAL_MARKS_RE = /[‎‏‪-‮⁦-⁩]/g;

function mapDigit(digit: string): string {
  const arabic = ARABIC_INDIC_DIGITS.indexOf(digit);
  if (arabic !== -1) {
    return String(arabic);
  }

  const eastern = EASTERN_ARABIC_INDIC_DIGITS.indexOf(digit);
  if (eastern !== -1) {
    return String(eastern);
  }

  const fullwidth = FULLWIDTH_DIGITS.indexOf(digit);
  if (fullwidth !== -1) {
    return String(fullwidth);
  }

  return digit;
}

/** Convert every Arabic-Indic / Eastern Arabic-Indic / fullwidth digit to ASCII. */
export function toAsciiDigits(value: string): string {
  if (!value) {
    return "";
  }

  return value.replace(NON_ASCII_DIGIT_RE, mapDigit);
}

/** ASCII digits only (everything else dropped), after digit normalization. */
export function digitsOnly(value: string): string {
  return toAsciiDigits(value).replace(/\D/g, "");
}

/** `true` when the string contains at least one digit in any supported script. */
export function hasAnyDigit(value: string): boolean {
  return /[0-9٠-٩۰-۹０-９]/.test(value);
}

/**
 * Normalize raw mobile-field input: ASCII digits, the `+` sign kept (Arabic
 * keyboards emit a fullwidth `＋` or wrap it in directional marks), spaces and
 * dashes kept for display. Feed the result to `toSaudiMobileInputValue` /
 * `getSaudiNationalMobile` which handle `+966` → `05…`.
 */
export function normalizeMobileInput(value: string): string {
  return toAsciiDigits(value)
    .replace(DIRECTIONAL_MARKS_RE, "")
    .replace(/[＋﹢]/g, "+");
}

const NUMERIC_INPUT_MODES = new Set(["numeric", "tel", "decimal"]);
const NUMERIC_INPUT_TYPES = new Set(["tel", "number"]);

/** Whether an `<input>` should get automatic digit normalization. */
export function isNumericInput(props: {
  inputMode?: string | null;
  type?: string | null;
}): boolean {
  return (
    (props.inputMode != null && NUMERIC_INPUT_MODES.has(props.inputMode)) ||
    (props.type != null && NUMERIC_INPUT_TYPES.has(props.type))
  );
}
