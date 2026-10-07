"use client";

import { useQuery } from "@tanstack/react-query";

import { lessorChangeKeys } from "@/features/lessor-change/query-keys";
import { getLessorChangeInfo } from "@/features/lessor-change/services/get-lessor-change-info";
import {
  FALLBACK_LESSOR_CHANGE_INFO,
  type LessorChangeInfo,
} from "@/features/lessor-change/types/lessor-change";
import { useContractPricing } from "@/features/pricing/hooks/use-contract-pricing";

/** `/lessor-change/info` with `/pricing.lessor_change_fee` as the fee fallback. */
export function useLessorChangeInfo() {
  const { pricing } = useContractPricing();
  const query = useQuery({
    queryKey: lessorChangeKeys.info(),
    queryFn: getLessorChangeInfo,
    staleTime: 5 * 60 * 1000,
  });

  const info: LessorChangeInfo = query.data ?? {
    ...FALLBACK_LESSOR_CHANGE_INFO,
    fee: pricing.lessor_change_fee,
  };

  return { ...query, info };
}
