/**
 * Create-contract feature flags.
 *
 * The wizard is draft-first: everything is filled offline in the browser
 * (localStorage draft) and replayed onto the backend only on the submit step
 * (`useSyncContractToServer`), through a *guest session* when the visitor has
 * no account (`features/guest-session`). From that point the order is real:
 * payment, "my requests" (same browser) and `/track` (any device) all work.
 *
 * SAVE_DRAFT_ENABLED: the mid-wizard "save draft to the server" actions
 * (header exit dialog, tenant step). They need a server contract id, which
 * does not exist before the submit step in the draft-first flow — the local
 * draft already survives reloads, so keep these hidden. The "save later"
 * option on the payment screen is independent (`SAVE_LATER_ON_PAYMENT_ENABLED`).
 */
export const SAVE_DRAFT_ENABLED = false;

/**
 * "ادفع لاحقاً" on the payment screen: marks the (already synced) order as a
 * draft on the server and sends the visitor to their requests. Works for
 * guest sessions too.
 */
export const SAVE_LATER_ON_PAYMENT_ENABLED = true;
