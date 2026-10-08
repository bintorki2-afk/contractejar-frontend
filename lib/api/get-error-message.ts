/** Arabic fallbacks shown to customers (never raw/English server errors). */
export const GENERIC_ERROR_MESSAGE = "حدث خطأ غير متوقع، حاول مرة أخرى.";
export const NETWORK_ERROR_MESSAGE =
  "تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت ثم حاول مرة أخرى.";

const ARABIC_LETTERS = /[\u0600-\u06FF]/;

/**
 * Message for a failed response. 5xx bodies ("Server Error", exception text,
 * gateway/cURL details) are never shown as-is: only an Arabic message the API
 * wrote on purpose survives, anything else becomes the generic Arabic text.
 */
export function getResponseErrorMessage(status: number, data: unknown): string {
  const message = getErrorMessage(data);
  if (status >= 500 && !ARABIC_LETTERS.test(message)) {
    return GENERIC_ERROR_MESSAGE;
  }
  return message;
}

export function getErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") {
    return GENERIC_ERROR_MESSAGE;
  }

  // Surface Laravel validation errors ({ errors: { field: ["msg", ...] } }) so
  // the user sees the actual reason instead of a generic "invalid data" message.
  const errors = (data as { errors?: unknown }).errors;
  if (errors && typeof errors === "object" && !Array.isArray(errors)) {
    const messages = Object.values(errors as Record<string, unknown>)
      .flatMap((value) =>
        Array.isArray(value)
          ? value.filter((item): item is string => typeof item === "string")
          : typeof value === "string"
            ? [value]
            : [],
      )
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join("\n");
    }
  }

  const message = (data as { message?: unknown }).message;

  if (typeof message === "string" && message.trim() !== "") {
    return message;
  }

  if (Array.isArray(message)) {
    return message.filter((item) => typeof item === "string").join(", ");
  }

  return GENERIC_ERROR_MESSAGE;
}
