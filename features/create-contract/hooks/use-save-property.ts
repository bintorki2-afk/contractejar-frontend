"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  saveProperty,
  unsaveProperty,
} from "@/features/create-contract/services/save-property";
import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";

export function useSaveProperty() {
  const contractSession = useCreateContractDraftStore(
    (state) => state.contractSession,
  );
  const contractStep1Data = useCreateContractDraftStore(
    (state) => state.contractStep1Data,
  );
  const contractStep2Data = useCreateContractDraftStore(
    (state) => state.contractStep2Data,
  );
  const contractStep3Data = useCreateContractDraftStore(
    (state) => state.contractStep3Data,
  );
  const contractStep4Data = useCreateContractDraftStore(
    (state) => state.contractStep4Data,
  );
  const contractStep5Data = useCreateContractDraftStore(
    (state) => state.contractStep5Data,
  );
  const [isSaving, setIsSaving] = useState(false);

  async function submitSaveProperty(
    nameRealEstate: string,
    messages: {
      missingContractSession: string;
      submitError: string;
      submitSuccess: string;
    },
  ) {
    if (isSaving) {
      return { ok: false as const };
    }

    const contractId =
      contractSession?.contractId ??
      contractStep1Data?.contract_id ??
      contractStep2Data?.contract_id ??
      contractStep3Data?.contract_id ??
      contractStep4Data?.contract_id ??
      contractStep5Data?.contract_id;

    if (!contractId) {
      toast.error(messages.missingContractSession);
      return { ok: false as const };
    }

    const trimmedName = nameRealEstate.trim();

    if (!trimmedName) {
      return { ok: false as const };
    }

    setIsSaving(true);

    try {
      const result = await saveProperty({
        contractId,
        nameRealEstate: trimmedName,
      });

      if (!result.ok) {
        toast.error(result.error || messages.submitError);
        return { ok: false as const };
      }

      toast.success(result.message || messages.submitSuccess);
      return { ok: true as const, propertyName: trimmedName };
    } finally {
      setIsSaving(false);
    }
  }

  async function submitUnsaveProperty(messages: {
    missingContractSession: string;
    submitError: string;
  }) {
    if (isSaving) {
      return { ok: false as const };
    }

    const contractId =
      contractSession?.contractId ??
      contractStep1Data?.contract_id ??
      contractStep2Data?.contract_id ??
      contractStep3Data?.contract_id ??
      contractStep4Data?.contract_id ??
      contractStep5Data?.contract_id;

    if (!contractId) {
      toast.error(messages.missingContractSession);
      return { ok: false as const };
    }

    setIsSaving(true);

    try {
      const result = await unsaveProperty(contractId);

      if (!result.ok) {
        toast.error(result.error || messages.submitError);
        return { ok: false as const };
      }

      return { ok: true as const };
    } finally {
      setIsSaving(false);
    }
  }

  return {
    submitSaveProperty,
    submitUnsaveProperty,
    isSaving,
  };
}
