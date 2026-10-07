"use server";

import { apiRequest } from "@/lib/api/api-request";

type GuestContactApiResponse = {
  message: string;
  code: number;
  success: boolean;
  data?: { contact_mobile: string };
};

/**
 * Stores the WhatsApp number the visitor typed on the submit step against the
 * guest session — it is what lets them track the order later (order number +
 * mobile) and what merges the order into their account after OTP.
 */
export async function setGuestContact(mobile: string): Promise<boolean> {
  const response = await apiRequest<GuestContactApiResponse>(
    "/auth/guest/contact",
    {
      method: "POST",
      cache: "no-store",
      body: JSON.stringify({ mobile }),
    },
  );

  return Boolean(response.ok && response.data?.success);
}
