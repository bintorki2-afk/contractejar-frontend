/**
 * Create-contract feature flags.
 *
 * SAVE_DRAFT_ENABLED: the "save draft / save later" feature saves the order to a
 * customer account and lets them resume it from the "قسم الطلبات" page. عقد إيجار
 * runs as a no-account site (login/register and /requests redirect to home), so
 * this flow cannot work — the save request returns 401 ("يجب تسجيل الدخول من جديد")
 * and there is no account page to resume from. Keep the code, hide the UI.
 */
export const SAVE_DRAFT_ENABLED = false;
