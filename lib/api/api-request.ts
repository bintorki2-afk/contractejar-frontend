// Server-only (not a server action): as a "use server" export, apiRequest would
// be an open proxy that attaches the user's bearer token to any endpoint.
import "server-only";

import { headers as requestHeaders } from "next/headers";
import { redirect } from "next/navigation";

import { clearAuthToken, getToken } from "@/actions/auth";
import {
  BASE_URL,
  WEBSITE_CLIENT_HEADER,
  WEBSITE_CLIENT_ID,
  WEBSITE_CLOSED_PATH,
} from "@/lib/api/constants";
import { compressFormDataImages } from "@/lib/api/image-utils";
import {
  getResponseErrorMessage,
  NETWORK_ERROR_MESSAGE,
} from "@/lib/api/get-error-message";
import type { ApiResponse } from "@/lib/api/types";
import { isWebsiteClosedResponse } from "@/lib/api/is-website-closed-response";

function buildAuthHeaders(token: string | null, isFormData: boolean): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
    // Identifies the web SPA so the backend serves the "website closed" 503.
    // Mobile clients must not send this.
    [WEBSITE_CLIENT_HEADER]: WEBSITE_CLIENT_ID,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * The API rate-limits by client IP, but every call from here leaves from the
 * website server: without the visitor's IP all customers share one budget
 * (e.g. 10 guest sessions or order lookups per minute for the whole site).
 * Forward it for per-visitor requests (never on cached fetches — headers are
 * part of the cache key).
 */
async function clientIpHeaders(): Promise<Record<string, string>> {
  try {
    const incoming = await requestHeaders();
    const ip =
      incoming.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      incoming.get("x-real-ip")?.trim() ||
      "";
    return ip ? { "X-Forwarded-For": ip } : {};
  } catch {
    // Outside a request (build time / static generation).
    return {};
  }
}

function isCachedFetch(options?: RequestInit): boolean {
  const next = (options as RequestInit & { next?: { revalidate?: number | false } })?.next;
  return options?.cache === "force-cache" || typeof next?.revalidate === "number";
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const token = await getToken();
  const isFormData = options?.body instanceof FormData;
  let requestOptions = options;

  if (isFormData && options?.body instanceof FormData) {
    const formData = await compressFormDataImages(options.body);
    requestOptions = {
      ...options,
      body: formData,
    };
  }

  let response: Response;
  let data: unknown;

  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...requestOptions,
      headers: {
        ...buildAuthHeaders(token, isFormData),
        ...(isCachedFetch(requestOptions) ? {} : await clientIpHeaders()),
        ...(requestOptions?.headers || {}),
      },
      // Bound every read so a slow/unresponsive backend cannot hang the request forever.
      signal: requestOptions?.signal ?? AbortSignal.timeout(20000),
    });

    data = await response.json().catch(() => null);
  } catch {
    return {
      ok: false,
      status: 500,
      error: NETWORK_ERROR_MESSAGE,
    };
  }

  // Interceptor: the website was closed for maintenance mid-session — send the
  // user to the full-screen closed page. Kept outside the try block so the
  // redirect error is not swallowed.
  if (isWebsiteClosedResponse(response.status, data)) {
    redirect(WEBSITE_CLOSED_PATH);
  }

  if (!response.ok) {
    if (response.status === 401) {
      // Only possible in a Server Action / Route Handler; while rendering a
      // Server Component the cookie cannot be changed (the page handles 401).
      await clearAuthToken().catch(() => undefined);
    }

    return {
      ok: false,
      status: response.status,
      error: getResponseErrorMessage(response.status, data),
    };
  }

  return {
    ok: true,
    status: response.status,
    data: data as T,
  };
}

export { clientIpHeaders };

export async function apiFormDataRequest<T>(
  endpoint: string,
  formData: FormData,
  method: string = "POST",
): Promise<ApiResponse<T>> {
  const token = await getToken();
  const compressedFormData = await compressFormDataImages(formData);

  let response: Response;
  let data: unknown;

  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      body: compressedFormData,
      headers: { ...buildAuthHeaders(token, true), ...(await clientIpHeaders()) },
      signal: AbortSignal.timeout(60000),
    });

    data = await response.json().catch(() => null);
  } catch {
    return {
      ok: false,
      status: 500,
      error: NETWORK_ERROR_MESSAGE,
    };
  }

  if (isWebsiteClosedResponse(response.status, data)) {
    redirect(WEBSITE_CLOSED_PATH);
  }

  if (!response.ok) {
    if (response.status === 401) {
      // Only possible in a Server Action / Route Handler; while rendering a
      // Server Component the cookie cannot be changed (the page handles 401).
      await clearAuthToken().catch(() => undefined);
    }

    return {
      ok: false,
      status: response.status,
      error: getResponseErrorMessage(response.status, data),
    };
  }

  return {
    ok: true,
    status: response.status,
    data: data as T,
  };
}
