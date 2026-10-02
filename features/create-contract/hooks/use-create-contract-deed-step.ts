"use client";

import {
  deedTypeIsDeceasedOwner,
  deedTypeIsLeaseRenewal,
  deedTypeIsSublease,
  deedTypeIsWaqfOwner,
  deedTypeNeedsFrontBack,
} from "@/features/create-contract/types/deed-type";
import {
  canContinueNationalAddress,
  DEFAULT_NATIONAL_ADDRESS_LOCATION,
} from "@/features/create-contract/types/national-address";
import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import { resolveContractAssetUrl } from "@/features/create-contract/utils/build-existing-contract-draft";
import { isManualDeedEntryComplete } from "@/features/shared/types/manual-deed-entry";
import { deedTypeSupportsManualEntry } from "@/features/shared/utils/supports-manual-deed-entry";

export function useCreateContractDeedStep() {
  const deed = useCreateContractDraftStore((state) => state.deed);
  const existingPropertyContext = useCreateContractDraftStore(
    (state) => state.existingPropertyContext,
  );
  const contractStep1Data = useCreateContractDraftStore(
    (state) => state.contractStep1Data,
  );
  const isDeedAlreadySubmitted = useCreateContractDraftStore(
    (state) => (state.contractStep1Data?.step ?? 0) >= 2,
  );
  const isAddressAlreadySubmitted = useCreateContractDraftStore(
    (state) => (state.contractStep2Data?.step ?? 0) >= 3,
  );
  const setSelectedDeedType = useCreateContractDraftStore(
    (state) => state.setSelectedDeedType,
  );
  const setDeedFiles = useCreateContractDraftStore((state) => state.setDeedFiles);
  const setDeedFrontFiles = useCreateContractDraftStore(
    (state) => state.setDeedFrontFiles,
  );
  const setDeedBackFiles = useCreateContractDraftStore(
    (state) => state.setDeedBackFiles,
  );
  const setDeedInheritanceFiles = useCreateContractDraftStore(
    (state) => state.setDeedInheritanceFiles,
  );
  const setDeedHeirsPoaFiles = useCreateContractDraftStore(
    (state) => state.setDeedHeirsPoaFiles,
  );
  const setDeedEndowmentCertFiles = useCreateContractDraftStore(
    (state) => state.setDeedEndowmentCertFiles,
  );
  const setDeedTrusteeshipFiles = useCreateContractDraftStore(
    (state) => state.setDeedTrusteeshipFiles,
  );
  const setIsMultipleTrusteeshipDeedCopy = useCreateContractDraftStore(
    (state) => state.setIsMultipleTrusteeshipDeedCopy,
  );
  const setHasMinorHeirs = useCreateContractDraftStore(
    (state) => state.setHasMinorHeirs,
  );
  const setDeedGuardiansPoaFiles = useCreateContractDraftStore(
    (state) => state.setDeedGuardiansPoaFiles,
  );
  const setNationalAddressMethod = useCreateContractDraftStore(
    (state) => state.setNationalAddressMethod,
  );
  const setNationalAddressPhotoFiles = useCreateContractDraftStore(
    (state) => state.setNationalAddressPhotoFiles,
  );
  const setNationalAddressLinkUrl = useCreateContractDraftStore(
    (state) => state.setNationalAddressLinkUrl,
  );
  const setNationalAddressManual = useCreateContractDraftStore(
    (state) => state.setNationalAddressManual,
  );
  const setUseManualDeedEntry = useCreateContractDraftStore(
    (state) => state.setUseManualDeedEntry,
  );
  const setManualDeedEntry = useCreateContractDraftStore(
    (state) => state.setManualDeedEntry,
  );
  const setLeaseRenewalAddressMode = useCreateContractDraftStore(
    (state) => state.setLeaseRenewalAddressMode,
  );
  const setMapLocation = useCreateContractDraftStore((state) => state.setMapLocation);

  const existingInstrumentImageUrl = resolveContractAssetUrl(
    existingPropertyContext?.property.image_instrument,
  );
  const existingInstrumentFrontImageUrl = resolveContractAssetUrl(
    contractStep1Data?.image_instrument_from_the_front,
  );
  const existingInstrumentBackImageUrl = resolveContractAssetUrl(
    contractStep1Data?.image_instrument_from_the_back,
  );
  const existingInheritanceImageUrl = resolveContractAssetUrl(
    contractStep1Data?.Image_inheritance_certificate,
  );
  const existingHeirsPoaImageUrl = resolveContractAssetUrl(
    contractStep1Data?.copy_power_of_attorney_from_heirs_to_agent,
  );
  const existingEndowmentCertImageUrl = resolveContractAssetUrl(
    contractStep1Data?.copy_of_the_endowment_registration_certificate,
  );
  const existingTrusteeshipImageUrl = resolveContractAssetUrl(
    contractStep1Data?.copy_of_the_trusteeship_deed,
  );
  const existingGuardiansPoaImageUrl = resolveContractAssetUrl(
    contractStep1Data?.copy_of_guardians_power_of_attorney_for_agent,
  );
  const existingAddressImageUrl = resolveContractAssetUrl(
    existingPropertyContext?.property.image_address,
  );
  const isInstrumentTypeLocked = existingPropertyContext !== null;
  const isLeaseRenewal = deedTypeIsLeaseRenewal(deed.selectedDeedType);
  const isSublease = deedTypeIsSublease(deed.selectedDeedType);
  const needsFrontBack = deedTypeNeedsFrontBack(deed.selectedDeedType);
  const isDeceasedOwner = deedTypeIsDeceasedOwner(deed.selectedDeedType);
  const isWaqfOwner = deedTypeIsWaqfOwner(deed.selectedDeedType);
  const isMultipleTrusteeshipDeedCopy = deed.isMultipleTrusteeshipDeedCopy;
  const hasMinorHeirs = deed.hasMinorHeirs;

  const hasFrontImage =
    deed.deedFrontFiles.length > 0 || existingInstrumentFrontImageUrl !== null;
  const hasBackImage =
    deed.deedBackFiles.length > 0 || existingInstrumentBackImageUrl !== null;
  const hasSingleImage =
    deed.deedFiles.length > 0 || existingInstrumentImageUrl !== null;
  const hasInheritanceImage =
    deed.deedInheritanceFiles.length > 0 || existingInheritanceImageUrl !== null;
  const hasHeirsPoaImage =
    deed.deedHeirsPoaFiles.length > 0 || existingHeirsPoaImageUrl !== null;
  const hasEndowmentCertImage =
    deed.deedEndowmentCertFiles.length > 0 || existingEndowmentCertImageUrl !== null;
  const hasTrusteeshipImage =
    deed.deedTrusteeshipFiles.length > 0 || existingTrusteeshipImageUrl !== null;
  const hasGuardiansPoaImage =
    deed.deedGuardiansPoaFiles.length > 0 || existingGuardiansPoaImageUrl !== null;

  const hasManualInstrumentEntry =
    deed.useManualDeedEntry &&
    deedTypeSupportsManualEntry(deed.selectedDeedType) &&
    isManualDeedEntryComplete(deed.manualDeedEntry);

  const isDeedComplete =
    isInstrumentTypeLocked ||
    isDeedAlreadySubmitted ||
    (deed.selectedDeedType !== "" &&
      (isLeaseRenewal
        ? hasSingleImage
        : hasManualInstrumentEntry
          ? isDeceasedOwner
            ? hasInheritanceImage &&
              hasHeirsPoaImage &&
              (!hasMinorHeirs || hasGuardiansPoaImage)
            : isWaqfOwner
              ? hasEndowmentCertImage &&
                hasTrusteeshipImage &&
                (!isMultipleTrusteeshipDeedCopy || hasGuardiansPoaImage)
              : true
          : needsFrontBack
            ? hasFrontImage && hasBackImage
            : isDeceasedOwner
              ? hasSingleImage &&
                hasInheritanceImage &&
                hasHeirsPoaImage &&
                (!hasMinorHeirs || hasGuardiansPoaImage)
              : isWaqfOwner
                ? hasSingleImage &&
                  hasEndowmentCertImage &&
                  hasTrusteeshipImage &&
                  (!isMultipleTrusteeshipDeedCopy || hasGuardiansPoaImage)
                : hasSingleImage));

  const showNationalAddress =
    deed.selectedDeedType !== "" && !isSublease;

  const isStandardAddressComplete = canContinueNationalAddress(
    deed.nationalAddressMethod,
    deed.nationalAddressPhotoFiles,
    deed.nationalAddressLinkUrl,
    {
      hasExistingPhoto: existingAddressImageUrl !== null,
      manualAddress: deed.nationalAddressManual,
    },
  );

  const isAddressComplete =
    isInstrumentTypeLocked ||
    isAddressAlreadySubmitted ||
    isSublease ||
    (isLeaseRenewal
      ? deed.leaseRenewalAddressMode === "same" ||
        (deed.leaseRenewalAddressMode === "change" && isStandardAddressComplete)
      : isStandardAddressComplete);

  const canContinue = isDeedComplete && isAddressComplete;

  return {
    selectedDeedType: deed.selectedDeedType,
    setSelectedDeedType,
    deedFiles: deed.deedFiles,
    setDeedFiles,
    deedFrontFiles: deed.deedFrontFiles,
    setDeedFrontFiles,
    deedBackFiles: deed.deedBackFiles,
    setDeedBackFiles,
    deedInheritanceFiles: deed.deedInheritanceFiles,
    setDeedInheritanceFiles,
    deedHeirsPoaFiles: deed.deedHeirsPoaFiles,
    setDeedHeirsPoaFiles,
    deedEndowmentCertFiles: deed.deedEndowmentCertFiles,
    setDeedEndowmentCertFiles,
    deedTrusteeshipFiles: deed.deedTrusteeshipFiles,
    setDeedTrusteeshipFiles,
    isMultipleTrusteeshipDeedCopy,
    setIsMultipleTrusteeshipDeedCopy,
    hasMinorHeirs,
    setHasMinorHeirs,
    deedGuardiansPoaFiles: deed.deedGuardiansPoaFiles,
    setDeedGuardiansPoaFiles,
    useManualDeedEntry: deed.useManualDeedEntry,
    setUseManualDeedEntry,
    manualDeedEntry: deed.manualDeedEntry,
    setManualDeedEntry,
    leaseRenewalAddressMode: deed.leaseRenewalAddressMode,
    setLeaseRenewalAddressMode,
    needsFrontBack,
    isDeceasedOwner,
    isWaqfOwner,
    nationalAddressMethod: deed.nationalAddressMethod,
    setNationalAddressMethod,
    nationalAddressPhotoFiles: deed.nationalAddressPhotoFiles,
    setNationalAddressPhotoFiles,
    nationalAddressLinkUrl: deed.nationalAddressLinkUrl,
    setNationalAddressLinkUrl,
    nationalAddressManual: deed.nationalAddressManual,
    setNationalAddressManual,
    mapLocation: deed.mapLocation ?? DEFAULT_NATIONAL_ADDRESS_LOCATION,
    setMapLocation,
    showNationalAddress,
    isDeedComplete,
    isAddressComplete,
    canContinue,
    existingInstrumentImageUrl,
    existingInstrumentFrontImageUrl,
    existingInstrumentBackImageUrl,
    existingInheritanceImageUrl,
    existingHeirsPoaImageUrl,
    existingEndowmentCertImageUrl,
    existingTrusteeshipImageUrl,
    existingGuardiansPoaImageUrl,
    existingAddressImageUrl,
    isInstrumentTypeLocked,
    isDeedAlreadySubmitted,
    isLeaseRenewal,
    isSublease,
  };
}
