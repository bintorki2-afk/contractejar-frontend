import {
  isManualNationalAddressComplete,
  type ManualNationalAddressData,
} from "@/features/shared/types/manual-national-address";

export const NATIONAL_ADDRESS_METHODS = [
  "photo",
  "link",
  "manual",
] as const;

export type NationalAddressMethodId = (typeof NATIONAL_ADDRESS_METHODS)[number];

/** Display order of the method select — Google Maps link first (the default). */
export const NATIONAL_ADDRESS_METHOD_ORDER: readonly NationalAddressMethodId[] = [
  "link",
  "manual",
  "photo",
];

export const DEFAULT_NATIONAL_ADDRESS_METHOD: NationalAddressMethodId = "link";

export type NationalAddressMapLocation = {
  lat: number;
  lng: number;
};

export const DEFAULT_NATIONAL_ADDRESS_LOCATION: NationalAddressMapLocation = {
  lat: 24.7136,
  lng: 46.6753,
};

/**
 * Validate the national-address "Google Maps link" field.
 *
 * Permissive by design so any real Google Maps share URL passes
 * (`https://maps.app.goo.gl/…`, `https://www.google.com/maps/…`,
 * `https://goo.gl/maps/…`) — a missing scheme is tolerated (we normalize to
 * https) and only the presence of a dotted hostname with no whitespace is
 * required. Returns false only for clearly-invalid input (empty, plain text,
 * or a string that cannot be parsed as a URL), so the deed step never silently
 * blocks on a valid-looking maps URL and can show a clear message otherwise.
 */
export function isValidNationalAddressLink(url: string): boolean {
  const trimmed = url.trim();

  if (trimmed === "" || /\s/.test(trimmed)) {
    return false;
  }

  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    return parsed.hostname.includes(".");
  } catch {
    return false;
  }
}

export function canContinueNationalAddress(
  method: NationalAddressMethodId | "",
  photoFiles: File[],
  linkUrl: string,
  options?: {
    hasExistingPhoto?: boolean;
    manualAddress?: ManualNationalAddressData;
  },
) {
  if (method === "photo") {
    return photoFiles.length > 0 || Boolean(options?.hasExistingPhoto);
  }

  if (method === "link") {
    return isValidNationalAddressLink(linkUrl);
  }

  if (method === "manual") {
    return options?.manualAddress
      ? isManualNationalAddressComplete(options.manualAddress)
      : false;
  }

  return false;
}
