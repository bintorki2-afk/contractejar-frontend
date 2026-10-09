import {
  DEFAULT_NATIONAL_ADDRESS_LOCATION,
  type NationalAddressMethodId,
} from "@/features/create-contract/types/national-address";
import {
  appendManualNationalAddressFields,
  type ManualNationalAddressData,
} from "@/features/shared/types/manual-national-address";

export type SubmitContractStep2Payload = {
  contractId: number;
  addressMethod: NationalAddressMethodId;
  latitude: number;
  longitude: number;
  imageAddress?: File;
  addressUrl?: string;
  manualAddress?: ManualNationalAddressData;
};

export function appendContractStep2Fields(
  formData: FormData,
  payload: SubmitContractStep2Payload,
) {
  formData.append("id", String(payload.contractId));

  // The wizard has no map picker: `mapLocation` keeps the Riyadh default
  // unless it came from a saved property. Never send that placeholder as the
  // property's real coordinates (it showed a fake pin in the dashboard).
  if (hasRealMapLocation(payload.latitude, payload.longitude)) {
    formData.append("latitude", String(payload.latitude));
    formData.append("longitude", String(payload.longitude));
    formData.append("lat", String(payload.latitude));
    formData.append("lng", String(payload.longitude));
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
/** True when the coordinates are a real location, not the empty/default placeholder. */
export function hasRealMapLocation(lat: unknown, lng: unknown): boolean {
  const la = Number(lat);
  const ln = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(ln) || (la === 0 && ln === 0)) {
    return false;
  }
  return !(
    la === DEFAULT_NATIONAL_ADDRESS_LOCATION.lat &&
    ln === DEFAULT_NATIONAL_ADDRESS_LOCATION.lng
  );
}
