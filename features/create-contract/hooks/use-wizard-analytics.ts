"use client";

import { useEffect, useRef } from "react";

import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import {
  toPropertyContractType,
  type ContractTypeId,
} from "@/features/create-contract/types/contract-type";
import type { CreateContractStep } from "@/features/create-contract/types/create-contract-step";
import { track } from "@/lib/analytics/track";

/**
 * Maps the website wizard (step + inner phase) onto the server's 1..6 data
 * steps (1 deed, 2 address, 3 owner, 4 tenant, 5 unit, 6 finance) and the
 * final «review» screen, and fires `wizard_step` once per visited step.
 */
function resolveAnalyticsStep(
  step: CreateContractStep,
  deedPhase: number,
  tenantPhase: number,
): number | "review" | null {
  switch (step) {
    case "deed":
      return deedPhase >= 1 ? 2 : 1;
    case "owner":
      return 3;
    case "tenant":
      return tenantPhase >= 1 ? 5 : 4;
    case "finance":
      return 6;
    case "payment":
      return "review";
    default:
      return null;
  }
}

export function useWizardAnalytics(contractType: ContractTypeId) {
  const currentStep = useCreateContractDraftStore((state) => state.currentStep);
  const deedPhase = useCreateContractDraftStore((state) => state.deed.currentPhaseIndex);
  const tenantPhase = useCreateContractDraftStore((state) => state.tenant.currentPhaseIndex);
  const lastFired = useRef<string | null>(null);

  useEffect(() => {
    const analyticsStep = resolveAnalyticsStep(currentStep, deedPhase, tenantPhase);
    if (analyticsStep === null) {
      return;
    }

    const key = `${contractType}:${analyticsStep}`;
    if (lastFired.current === key) {
      return;
    }
    lastFired.current = key;

    track("wizard_step", {
      contract_type: toPropertyContractType(contractType),
      step: analyticsStep,
    });
  }, [contractType, currentStep, deedPhase, tenantPhase]);
}

/** `wizard_start` — fired when the customer presses «ابدأ» on the intro step. */
export function trackWizardStart(contractType: ContractTypeId) {
  track("wizard_start", { contract_type: toPropertyContractType(contractType) });
}
