"use client";

import { useQuery } from "@tanstack/react-query";

import { getCouponAvailability } from "@/features/pricing/services/get-coupon-availability";
import { contractPricingKeys } from "@/features/pricing/query-keys";

export function useCouponAvailability() {
  const query = useQuery({
    queryKey: [...contractPricingKeys.all, "coupons-available"] as const,
    queryFn: getCouponAvailability,
    staleTime: 5 * 60 * 1000,
  });

  return { ...query, available: query.data === true };
}
