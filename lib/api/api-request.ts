// Server-only (not a server action): as a "use server" export, apiRequest would
// be an open proxy that attaches the user's bearer token to any endpoint.
import "server-only";

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
      headers: buildAuthHeaders(token, true),
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
