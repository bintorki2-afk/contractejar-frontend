"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { submitPropertyStep1 } from "@/features/create-property/services/submit-property-step1";
import { updatePropertyStep1 } from "@/features/create-property/services/update-property-step1";
import { useCreatePropertyDraftStore } from "@/features/create-property/stores/use-create-property-draft-store";
import {
  propertyDeedTypeIsDeceasedOwner,
  propertyDeedTypeIsWaqfOwner,
  propertyDeedTypeNeedsFrontBack,
} from "@/features/create-property/types/deed-type";
import { parsePropertyId } from "@/features/create-property/utils/parse-property-id";
import { isPropertyDeedDataComplete } from "@/features/create-property/utils/validate-property-deed-data";
import { toPropertyContractType } from "@/features/create-property/utils/contract-type";
import { parsePropertyType } from "@/features/properties/types/property-type";

export function useSubmitPropertyStep1() {
  const searchParams = useSearchParams();
  const urlPropertyId = parsePropertyId(searchParams.get("propertyId") ?? undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedDeedType = useCreatePropertyDraftStore(
    (state) => state.selectedDeedType,
  );
  const deedFiles = useCreatePropertyDraftStore((state) => state.deedFiles);
  const deedFrontFiles = useCreatePropertyDraftStore((state) => state.deedFrontFiles);
  const deedBackFiles = useCreatePropertyDraftStore((state) => state.deedBackFiles);
  const deedInheritanceFiles = useCreatePropertyDraftStore(
    (state) => state.deedInheritanceFiles,
  );
  const deedHeirsPoaFiles = useCreatePropertyDraftStore(
    (state) => state.deedHeirsPoaFiles,
  );
  const deedEndowmentCertFiles = useCreatePropertyDraftStore(
    (state) => state.deedEndowmentCertFiles,
  );
  const deedTrusteeshipFiles = useCreatePropertyDraftStore(
    (state) => state.deedTrusteeshipFiles,
  );
  const isMultipleTrusteeshipDeedCopy = useCreatePropertyDraftStore(
    (state) => state.isMultipleTrusteeshipDeedCopy,
  );
  const hasMinorHeirs = useCreatePropertyDraftStore((state) => state.hasMinorHeirs);
  const deedGuardiansPoaFiles = useCreatePropertyDraftStore(
    (state) => state.deedGuardiansPoaFiles,
  );
  const addressMethod = useCreatePropertyDraftStore((state) => state.addressMethod);
  const addressPhotoFiles = useCreatePropertyDraftStore(
    (state) => state.addressPhotoFiles,
  );
  const addressLinkUrl = useCreatePropertyDraftStore((state) => state.addressLinkUrl);
  const addressManual = useCreatePropertyDraftStore((state) => state.addressManual);
  const mapLocation = useCreatePropertyDraftStore((state) => state.mapLocation);
  const propertyId = useCreatePropertyDraftStore((state) => state.propertyId);
  const existingDeedImageUrl = useCreatePropertyDraftStore(
    (state) => state.existingDeedImageUrl,
  );
  const existingDeedFrontImageUrl = useCreatePropertyDraftStore(
    (state) => state.existingDeedFrontImageUrl,
  );
  const existingDeedBackImageUrl = useCreatePropertyDraftStore(
    (state) => state.existingDeedBackImageUrl,
  );
  const existingInheritanceImageUrl = useCreatePropertyDraftStore(
    (state) => state.existingInheritanceImageUrl,
  );
  const existingHeirsPoaImageUrl = useCreatePropertyDraftStore(
    (state) => state.existingHeirsPoaImageUrl,
  );
  const existingEndowmentCertImageUrl = useCreatePropertyDraftStore(
    (state) => state.existingEndowmentCertImageUrl,
  );
  const existingTrusteeshipImageUrl = useCreatePropertyDraftStore(
    (state) => state.existingTrusteeshipImageUrl,
  );
  const existingGuardiansPoaImageUrl = useCreatePropertyDraftStore(
    (state) => state.existingGuardiansPoaImageUrl,
  );
  const useManualDeedEntry = useCreatePropertyDraftStore(
    (state) => state.useManualDeedEntry,
  );
  const manualDeedEntry = useCreatePropertyDraftStore((state) => state.manualDeedEntry);
  const setPropertyId = useCreatePropertyDraftStore((state) => state.setPropertyId);
  const isEditMode = urlPropertyId !== null;
  const editPropertyId = urlPropertyId ?? propertyId;

  async function submitStep1() {
    const deedComplete = isPropertyDeedDataComplete({
      selectedDeedType,
      deedFiles,
      deedFrontFiles,
      deedBackFiles,
      deedInheritanceFiles,
      deedHeirsPoaFiles,
      deedEndowmentCertFiles,
      deedTrusteeshipFiles,
      deedGuardiansPoaFiles,
      isMultipleTrusteeshipDeedCopy,
      hasMinorHeirs,
      useManualDeedEntry,
      manualDeedEntry,
      existingImages: {
        instrument: existingDeedImageUrl,
        front: existingDeedFrontImageUrl,
        back: existingDeedBackImageUrl,
        inheritance: existingInheritanceImageUrl,
        heirsPoa: existingHeirsPoaImageUrl,
        endowmentCert: existingEndowmentCertImageUrl,
        trusteeship: existingTrusteeshipImageUrl,
        guardiansPoa: existingGuardiansPoaImageUrl,
      },
    });

    if (!deedComplete || selectedDeedType === "") {
      return {
        ok: false as const,
        error: "Deed data is incomplete",
      };
    }

    if (!addressMethod) {
      return {
        ok: false as const,
        error: "National address method is required",
      };
    }

    if (isEditMode && !editPropertyId) {
      return {
        ok: false as const,
        error: "Property ID is missing",
      };
    }

    setIsSubmitting(true);

    try {
      const needsFrontBack = propertyDeedTypeNeedsFrontBack(selectedDeedType);
      const isDeceasedOwner = propertyDeedTypeIsDeceasedOwner(selectedDeedType);
      const isWaqfOwner = propertyDeedTypeIsWaqfOwner(selectedDeedType);

      const payload = {
        instrumentType: selectedDeedType,
        imageInstrument:
          needsFrontBack || useManualDeedEntry ? undefined : deedFiles[0],
        imageInstrumentFront:
          needsFrontBack && !useManualDeedEntry ? deedFrontFiles[0] : undefined,
        imageInstrumentBack:
          needsFrontBack && !useManualDeedEntry ? deedBackFiles[0] : undefined,
        manualDeedEntry: useManualDeedEntry ? manualDeedEntry : undefined,
        imageInheritanceCertificate: isDeceasedOwner
          ? deedInheritanceFiles[0]
          : undefined,
        copyPowerOfAttorneyFromHeirsToAgent: isDeceasedOwner
          ? deedHeirsPoaFiles[0]
          : undefined,
        copyOfTheEndowmentRegistrationCertificate: isWaqfOwner
          ? deedEndowmentCertFiles[0]
          : undefined,
        copyOfTheTrusteeshipDeed: isWaqfOwner ? deedTrusteeshipFiles[0] : undefined,
        isMultipleTrusteeshipDeedCopy: isWaqfOwner
          ? isMultipleTrusteeshipDeedCopy
          : undefined,
        copyOfGuardiansPowerOfAttorneyForAgent:
          (isWaqfOwner && isMultipleTrusteeshipDeedCopy) ||
          (isDeceasedOwner && hasMinorHeirs)
            ? deedGuardiansPoaFiles[0]
            : undefined,
        addressMethod,
        imageAddress:
          addressMethod === "photo" ? addressPhotoFiles[0] : undefined,
        addressUrl:
          addressMethod === "link" ? addressLinkUrl.trim() || undefined : undefined,
        manualAddress: addressMethod === "manual" ? addressManual : undefined,
        latitude: mapLocation.lat,
        longitude: mapLocation.lng,
      };

      const result =
        isEditMode && editPropertyId
          ? await updatePropertyStep1({
              ...payload,
              propertyId: editPropertyId,
            })
          : await submitPropertyStep1({
              ...payload,
              contractType: toPropertyContractType(
                parsePropertyType(searchParams.get("type") ?? undefined),
              ),
            });

      if (!result.ok) {
        return result;
      }

      setPropertyId(isEditMode ? editPropertyId : result.propertyId);
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    propertyId: editPropertyId,
    isSubmitting,
    submitStep1,
  };
}
