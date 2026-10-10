"use server";

import type { ContractInstrumentType } from "@/features/create-contract/types/instrument-type";
import type { ContractStep1ApiData } from "@/features/create-contract/types/contract-step1-api";
import { appendManualDeedEntryFields } from "@/features/shared/types/manual-deed-entry";
import type { ManualDeedEntryData } from "@/features/shared/types/manual-deed-entry";
import { normalizeContractStepFix } from "@/features/create-contract/types/contract-fix-api";
import { apiFormDataRequest } from "@/lib/api/api-request";

type ContractStep1ApiResponse = {
  message: string;
  code: number;
  success: boolean;
  data?: ContractStep1ApiData;
  /** دفعة هـ (E4): وضع التصحيح — الحقول المتغيّرة والطلبات المحلولة. */
  fix?: unknown;
};

export type SubmitContractStep1Payload = {
  contractId: number;
  instrumentType: ContractInstrumentType;
  imageInstrument?: File;
  /** Extra pages of a multi-page (paper) deed, in order — after the first page. */
  imageInstrumentPages?: File[];
  imageInstrumentFront?: File;
  imageInstrumentBack?: File;
  imageInheritanceCertificate?: File;
  copyPowerOfAttorneyFromHeirsToAgent?: File;
  copyOfTheEndowmentRegistrationCertificate?: File;
  copyOfTheTrusteeshipDeed?: File;
  isMultipleTrusteeshipDeedCopy?: boolean;
  copyOfGuardiansPowerOfAttorneyForAgent?: File;
  manualDeedEntry?: ManualDeedEntryData;
};

export async function submitContractStep1(payload: SubmitContractStep1Payload) {
  const formData = new FormData();
  formData.append("id", String(payload.contractId));
  formData.append("instrument_type", payload.instrumentType);

  if (payload.imageInstrument) {
    formData.append("image_instrument", payload.imageInstrument);
  }

  for (const page of payload.imageInstrumentPages ?? []) {
    formData.append("image_instrument_pages[]", page);
  }

  if (payload.imageInstrumentFront) {
    formData.append("image_instrument_from_the_front", payload.imageInstrumentFront);
  }

  if (payload.imageInstrumentBack) {
    formData.append("image_instrument_from_the_back", payload.imageInstrumentBack);
  }

  if (payload.imageInheritanceCertificate) {
    formData.append(
      "Image_inheritance_certificate",
      payload.imageInheritanceCertificate,
    );
  }

  if (payload.copyPowerOfAttorneyFromHeirsToAgent) {
    formData.append(
      "copy_power_of_attorney_from_heirs_to_agent",
      payload.copyPowerOfAttorneyFromHeirsToAgent,
    );
  }

  if (payload.copyOfTheEndowmentRegistrationCertificate) {
    formData.append(
      "copy_of_the_endowment_registration_certificate",
      payload.copyOfTheEndowmentRegistrationCertificate,
    );
  }

  if (payload.copyOfTheTrusteeshipDeed) {
    formData.append(
      "copy_of_the_trusteeship_deed",
      payload.copyOfTheTrusteeshipDeed,
    );
  }

  if (payload.isMultipleTrusteeshipDeedCopy !== undefined) {
    formData.append(
      "is_multiple_trusteeship_deed_copy",
      payload.isMultipleTrusteeshipDeedCopy ? "1" : "0",
    );
  }

  if (payload.copyOfGuardiansPowerOfAttorneyForAgent) {
    formData.append(
      "copy_of_guardians_power_of_attorney_for_agent",
      payload.copyOfGuardiansPowerOfAttorneyForAgent,
    );
  }

  if (payload.manualDeedEntry) {
    appendManualDeedEntryFields(formData, payload.manualDeedEntry);
  }

  const response = await apiFormDataRequest<ContractStep1ApiResponse>(
    "/contract/step1",
    formData,
  );

  if (!response.ok || !response.data?.success || !response.data.data) {
    return {
      ok: false as const,
      status: response.status,
      error: response.error || response.data?.message || "Failed to submit deed data",
    };
  }

  return {
    ok: true as const,
    data: response.data.data,
    message: response.data.message,
    fix: normalizeContractStepFix(response.data.fix),
  };
}
