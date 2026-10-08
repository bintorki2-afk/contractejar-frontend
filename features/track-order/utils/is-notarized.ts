/** Notarization done (or completed): the journey reached its last step. */
export function isNotarized(input: { status?: string | null; status_key?: string | null; journey?: unknown }) {
  const keys = [input.status_key, input.status].map((v) => (typeof v === "string" ? v : "").toLowerCase());
  if (keys.some((key) => key === "ejar_authenticated" || key === "completed")) {
    return true;
  }
  if (Array.isArray(input.journey)) {
    return input.journey.some((step) => {
      const row = (step ?? {}) as Record<string, unknown>;
      const done = row.done === true || row.state === "completed";
      return done && (row.key === "ejar_authenticated" || row.key === "completed");
    });
  }
  return false;
}
