"use client";

import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import {
  toPropertyContractType,
  type ContractTypeId,
} from "@/features/create-contract/types/contract-type";
import { generateOrderReference } from "@/features/create-contract/utils/generate-order-reference";

export function useStartFreshContract(contractType: ContractTypeId) {
  const contractSession = useCreateContractDraftStore((state) => state.contractSession);
  const setFreshContractSession = useCreateContractDraftStore(
    (state) => state.setFreshContractSession,
  );
  const goNextStep = useCreateContractDraftStore((state) => state.goNextStep);

  function handleStart() {
    const apiContractType = toPropertyContractType(contractType);

    if (
      contractSession &&
      !contractSession.isReal &&
      contractSession.contractType === apiContractType
    ) {
      goNextStep();
      return;
    }

    setFreshContractSession({
      contractId: Date.now(),
      uuid: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
      contractType: apiContractType,
      isReal: false,
      orderReference: generateOrderReference(),
    });

    goNextStep();
  }

  return {
    handleStart,
    isStarting: false,
  };
}
