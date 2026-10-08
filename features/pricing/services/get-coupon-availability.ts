"use server";

import { apiRequest } from "@/lib/api/api-request";

type CouponAvailabilityApiResponse = {
  message: string;
  code: number;
  success: boolean;
  data?: { available: boolean };
};

/** `GET /coupons/available` — whether the discount-code field should be shown at all. */
export async function getCouponAvailability(): Promise<boolean> {
  const response = await apiRequest<CouponAvailabilityApiResponse>(
    "/coupons/available",
    { method: "GET", cache: "no-store" },
  );

  if (!response.ok || !response.data?.success) {
    return false;
  }

  return response.data.data?.available === true;
}
