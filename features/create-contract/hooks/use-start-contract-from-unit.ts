"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import type { ContractTypeId } from "@/features/create-contract/types/contract-type";
import { generateOrderReference } from "@/features/create-contract/utils/generate-order-reference";
import type { PropertyUnitCardData } from "@/features/property-units/types/property-unit";
import type { PropertyWithUnitsApiData } from "@/features/property-units/types/property-units-api";

function toContractTypeId(
  contractType: PropertyUnitCardData["contractType"],
): ContractTypeId {
  return contractType === "commercial" ? "commercial" : "residential";
}

export function useStartContractFromUnit() {
  const router = useRouter();
  const t = useTranslations("propertyUnits.card");
  const startExistingPropertyContractFlow = useCreateContractDraftStore(
    (state) => state.startExistingPropertyContractFlow,
  );
  const [startingUnitIds, setStartingUnitIds] = useState<number[]>([]);
  const isStarting = startingUnitIds.length > 0;

  function handleStartContract(
    selectedUnits: PropertyUnitCardData[],
    property: PropertyWithUnitsApiData,
  ) {
    if (selectedUnits.length < 1) {
      toast.error(t("selectAtLeastOneUnit"));
      return;
    }

    const unitIds = selectedUnits.map((unit) => unit.unitId);
    const apiUnits = property.units.filter((item) => unitIds.includes(item.id));

    if (apiUnits.length !== selectedUnits.length) {
      toast.error(t("startContractError"));
      return;
    }

    const contractType = selectedUnits[0].contractType;

    setStartingUnitIds(unitIds);

    try {
      // QA PROPS-8 — «المعالج مسودة أولاً»: nothing is created on the server
      // until «إرسال الطلب». Calling `/contract/start` here left a «جديد»
      // order behind on every click (7 clicks → 7 orders) and, because the
      // session never recorded it as the server identity, the submit created
      // a second one. The submit (`useSyncContractToServer`) starts the
      // contract with `is_real`, `real_id` and `unit_ids` from this session.
      startExistingPropertyContractFlow({
        session: {
          contractId: Date.now(),
          uuid: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
          contractType,
          isReal: true,
          realId: selectedUnits[0].propertyId,
          realUnitsId: unitIds[0],
          unitIds,
          unitsCount: unitIds.length,
          orderReference: generateOrderReference(),
        },
        context: {
          property,
          units: apiUnits,
        },
      });

      router.push(`/create-contract?id=${toContractTypeId(contractType)}`);
    } finally {
      setStartingUnitIds([]);
    }
  }

  return {
    startContract: handleStartContract,
    isStarting,
    startingUnitIds,
  };
}
