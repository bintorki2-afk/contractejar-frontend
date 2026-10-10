/** `?fix=<id>` (push / WhatsApp deep link to a pending data request) → number or null. */
export function parseFixParam(value: string | string[] | null | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null || raw === "") return null;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? Math.trunc(id) : null;
}

/** `?step=<n>` → 1..7 or null. */
export function parseStepParam(value: string | string[] | null | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null || raw === "") return null;
  const step = Number(raw);
  return Number.isFinite(step) && step >= 1 && step <= 7 ? Math.trunc(step) : null;
}
