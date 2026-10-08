"use server";

import { cache } from "react";

import {
  BASE_URL,
  WEBSITE_CLIENT_HEADER,
  WEBSITE_CLIENT_ID,
} from "@/lib/api/constants";
import type {
  WebsiteStatus,
  WebsiteStatusApiResponse,
} from "@/features/website-status/types/website-status";

const WEBSITE_STATUS_ENDPOINT = "/website-status";

const OPEN: WebsiteStatus = {
  isOpen: true,
  messageAr: null,
  messageEn: null,
};

/**
 * Boot check for the web SPA. Called before rendering routes (root layout) and
 * by the maintenance page. Uses a bare `fetch` — not `apiRequest` — so it stays
 * unauthenticated and is not itself caught by the 503 redirect interceptor.
 *
 * Fails open: a network/parse error is not a closure signal.
 */
const fetchWebsiteStatus = cache(async function fetchWebsiteStatus(): Promise<WebsiteStatus> {
  try {
    const response = await fetch(`${BASE_URL}${WEBSITE_STATUS_ENDPOINT}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        [WEBSITE_CLIENT_HEADER]: WEBSITE_CLIENT_ID,
      },
      // Called by the root layout on every page: cached 30 s (closing the site
      // from the dashboard shows within 30 s) instead of one API call per view.
      next: { revalidate: 30 },
    });

    const body = (await response
      .json()
      .catch(() => null)) as WebsiteStatusApiResponse | null;
    const data = body?.data;

    const isOpen = response.status !== 503 && data?.is_open !== false;

    if (isOpen) {
      return OPEN;
    }

    return {
      isOpen: false,
      messageAr: data?.message_ar ?? data?.message ?? body?.message ?? null,
      messageEn: data?.message_en ?? null,
    };
  } catch {
    return OPEN;
  }
});

export async function getWebsiteStatus(): Promise<WebsiteStatus> {
  return fetchWebsiteStatus();
}
