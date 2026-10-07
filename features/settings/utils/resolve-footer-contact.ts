import type { AppSettings } from "@/features/settings/types/app-settings";
import {
  buildWhatsappHref,
  resolveSettingsWhatsappNumber,
} from "@/features/settings/utils/build-whatsapp-href";
import { digitsOnly } from "@/lib/utils/digits";

export type FooterSocialLink = {
  id: string;
  href: string;
  label: string;
};

function asAbsoluteUrl(value: string | null | undefined) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) {
    return null;
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  return `https://${raw.replace(/^\/+/, "")}`;
}

function resolveSnapchatHref(value: string | null | undefined) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) {
    return null;
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  const username = raw.replace(/^@/, "");
  return `https://www.snapchat.com/add/${username}`;
}

export function formatSaudiPhoneDisplay(contactNumber: string | null | undefined) {
  const raw = typeof contactNumber === "string" ? contactNumber.trim() : "";
  if (!raw) {
    return null;
  }

  const digits = digitsOnly(raw);
  if (!digits) {
    return null;
  }

  const normalized = digits.startsWith("966")
    ? digits
    : digits.startsWith("0")
      ? `966${digits.slice(1)}`
      : `966${digits}`;

  if (normalized.length === 12) {
    return `+${normalized.slice(0, 3)} ${normalized.slice(3, 5)} ${normalized.slice(5, 8)} ${normalized.slice(8)}`;
  }

  return `+${normalized}`;
}

export function resolveFooterPhone(
  settings: AppSettings | null | undefined,
  fallbackPhone: string,
) {
  const number = resolveSettingsWhatsappNumber(settings);
  return formatSaudiPhoneDisplay(number) ?? fallbackPhone;
}

export function resolveFooterPhoneHref(
  settings: AppSettings | null | undefined,
) {
  const number = resolveSettingsWhatsappNumber(settings);
  if (!number) {
    return null;
  }

  const digits = digitsOnly(number);
  if (!digits) {
    return null;
  }

  const normalized = digits.startsWith("966")
    ? digits
    : digits.startsWith("0")
      ? `966${digits.slice(1)}`
      : `966${digits}`;

  return `tel:+${normalized}`;
}

export function resolveFooterWhatsappHref(
  settings: AppSettings | null | undefined,
) {
  return buildWhatsappHref(resolveSettingsWhatsappNumber(settings));
}

export function resolveFooterSocialLinks(
  settings: AppSettings | null | undefined,
): FooterSocialLink[] {
  // No default profiles: an icon renders only for a value set in the dashboard.
  const s = settings ?? ({} as AppSettings);

  const links: Array<FooterSocialLink | null> = [
    {
      id: "snapchat",
      href: resolveSnapchatHref(s.snapchat) ?? "",
      label: "Snapchat",
    },
    {
      id: "instagram",
      href: asAbsoluteUrl(s.instagram) ?? "",
      label: "Instagram",
    },
    {
      id: "tiktok",
      href: asAbsoluteUrl(s.tiktok) ?? "",
      label: "TikTok",
    },
    {
      id: "twitter",
      href: asAbsoluteUrl(s.twitter) ?? "",
      label: "X",
    },
    {
      id: "facebook",
      href: asAbsoluteUrl(s.facebook) ?? "",
      label: "Facebook",
    },
    {
      id: "linkedin",
      href: asAbsoluteUrl(s.linkedIn) ?? "",
      label: "LinkedIn",
    },
  ];

  return links.filter((link): link is FooterSocialLink => Boolean(link?.href));
}
