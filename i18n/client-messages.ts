import type { AbstractIntlMessages } from "next-intl";

/**
 * Message namespaces that only the service flows need on the client (wizard,
 * properties, orders, payment, lessor-change flow). They are ~70% of the
 * translations, so the root provider leaves them out and
 * `app/(services)/layout.tsx` adds them back with a nested provider (#27 —
 * smaller HTML/RSC payload on every marketing page).
 *
 * If a client component outside `(services)` needs one of these namespaces,
 * remove it from this list (next-intl logs a MISSING_MESSAGE error instead).
 */
export const SERVICES_ONLY_NAMESPACES = [
  "createContract",
  "createProperty",
  "createUnit",
  "requests",
  "myProperties",
  "propertyUnits",
  "properties",
  "instrumentTypePopup",
  "paymentStatus",
  "lessorChange",
] as const;

/** Messages for the root provider: everything except the service-only namespaces. */
export function pickCoreMessages(messages: AbstractIntlMessages): AbstractIntlMessages {
  const excluded = new Set<string>(SERVICES_ONLY_NAMESPACES);
  return Object.fromEntries(
    Object.entries(messages).filter(([namespace]) => !excluded.has(namespace)),
  );
}
