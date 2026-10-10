import { hasRealMapLocation } from "@/features/create-contract/utils/build-contract-step2-form-data";
import type { PropertyDeedTypeId } from "@/features/create-property/types/deed-type";
import type { PropertyNationalAddressMethodId } from "@/features/create-property/types/national-address";
import {
  appendManualNationalAddressFields,
  type ManualNationalAddressData,
} from "@/features/shared/types/manual-national-address";
import {
  appendManualDeedEntryFields,
  type ManualDeedEntryData,
} from "@/features/shared/types/manual-deed-entry";

export type PropertyStep1FormPayload = {
  propertyId?: number;
  instrumentType: PropertyDeedTypeId;
  imageInstrument?: File;
  imageInstrumentFront?: File;
  imageInstrumentBack?: File;
  imageInheritanceCertificate?: File;
  copyPowerOfAttorneyFromHeirsToAgent?: File;
  copyOfTheEndowmentRegistrationCertificate?: File;
  copyOfTheTrusteeshipDeed?: File;
  isMultipleTrusteeshipDeedCopy?: boolean;
  copyOfGuardiansPowerOfAttorneyForAgent?: File;
  manualDeedEntry?: ManualDeedEntryData;
  addressMethod: PropertyNationalAddressMethodId;
  imageAddress?: File;
  addressUrl?: string;
  manualAddress?: ManualNationalAddressData;
  latitude: number;
  longitude: number;
  /** `housing` | `commercial` — sent on create (QA PROPS-5: was never sent). */
  contractType?: "housing" | "commercial";
};

export function appendPropertyStep1Fields(
  formData: FormData,
  payload: PropertyStep1FormPayload,
) {
  if (payload.propertyId) {
    formData.append("id", String(payload.propertyId));
  }

  formData.append("instrument_type", payload.instrumentType);

  if (payload.contractType) {
    formData.append("contract_type", payload.contractType);
  }

  if (payload.imageInstrument) {
    formData.append("image_instrument", payload.imageInstrument);
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
    formData.append("copy_of_the_trusteeship_deed", payload.copyOfTheTrusteeshipDeed);
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

  // QA PROPS-6: the Riyadh map placeholder was saved as every property's
  // location. Only a real pin is sent; for a Google Maps link the server
  // reads the coordinates from `address_url`.
  if (hasRealMapLocation(payload.latitude, payload.longitude)) {
    formData.append("latitude", String(payload.latitude));
    formData.append("longitude", String(payload.longitude));
  }

  if (payload.addressMethod === "photo" && payload.imageAddress) {
    formData.append("image_address", payload.imageAddress);
  }

  if (payload.addressMethod === "link" && payload.addressUrl) {
    formData.append("address_url", payload.addressUrl);
  }

  if (payload.addressMethod === "manual" && payload.manualAddress) {
    appendManualNationalAddressFields(formData, payload.manualAddress);
  }
}
