"use client";

import Link from "next/link";
import { FaSnapchatGhost } from "react-icons/fa";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaXTwitter,
} from "react-icons/fa6";

import { useAppSettings } from "@/features/settings/hooks/use-app-settings";
import { resolveFooterSocialLinks } from "@/features/settings/utils/resolve-footer-contact";

type UserSheetSocialBarProps = {
  followUs: string;
};

const SOCIAL_ICONS = {
  snapchat: FaSnapchatGhost,
  instagram: FaInstagram,
  tiktok: FaTiktok,
  twitter: FaXTwitter,
  facebook: FaFacebookF,
  linkedin: FaLinkedinIn,
} as const;

/**
 * «تابعنا على» inside the account sheet — the same settings-driven links as
 * the footer: an icon appears only for a profile set in the dashboard.
 */
export default function UserSheetSocialBar({ followUs }: UserSheetSocialBarProps) {
  const settingsQuery = useAppSettings();
  const links = resolveFooterSocialLinks(settingsQuery.data);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-4 rounded-3xl bg-brand-background px-4 py-3">
      <p className="text-sm font-bold text-foreground">{followUs}</p>

      <div className="flex items-center gap-2">
        {links.map(({ id, href, label }) => {
          const Icon = SOCIAL_ICONS[id as keyof typeof SOCIAL_ICONS];
          if (!Icon) {
            return null;
          }

          return (
            <Link
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="inline-flex size-9 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand/90"
            >
              <Icon className="size-4" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
