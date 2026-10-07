export const AUTH_TOKEN_COOKIE = "access_token";

/**
 * Set (alongside the auth cookie) when the session is a website *guest* —
 * a server-issued token with no account, created so the contract wizard and
 * payment can run server-backed without signing in. Not httpOnly on purpose:
 * it carries no secret, and the middleware/UI only need to know "this session
 * is a guest, not a signed-in customer".
 */
export const GUEST_SESSION_COOKIE = "aqdi_guest";

export const AUTH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

// NOTE (test deployment): fall back to the Railway TEST backend when
// NEXT_PUBLIC_BASE_URL is unset OR empty. A real env var still overrides this.
// Revert to `?? ""` before shipping to production.
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://aqdi-new-backend-main-production.up.railway.app/api/v2";

/**
 * Marks every request as coming from the web SPA. The backend only returns the
 * "website closed" 503 (see `features/website-status`) when it recognises the
 * caller as the website — mobile clients must never send this.
 */
export const WEBSITE_CLIENT_HEADER = "X-Client";
export const WEBSITE_CLIENT_ID = "website";

/** Route that renders the full-screen maintenance page. */
export const WEBSITE_CLOSED_PATH = "/maintenance";
