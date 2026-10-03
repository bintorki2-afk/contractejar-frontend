"use client";

import { ChevronLeft } from "lucide-react";

import UserSheetSectionCard from "@/features/auth/components/user-sheet-section-card";
import type { AuthUser } from "@/features/auth/types/auth-user";
import { formatPhoneDisplay } from "@/features/auth/utils/format-phone-display";
import CustomIcon from "@/features/shared/components/custom-icon";

type UserSheetProfileSectionProps = {
  user: AuthUser;
  sectionTitle: string;
  avatarAlt: string;
  onEditProfile: () => void;
};

export default function UserSheetProfileSection({
  user,
  sectionTitle,
  avatarAlt,
  onEditProfile,
}: UserSheetProfileSectionProps) {
  const displayName = user.full_name || user.name;
  const displayPhone = formatPhoneDisplay(user.mobile || user.phone);

  return (
    <UserSheetSectionCard title={sectionTitle}>
      <button
        type="button"
        onClick={onEditProfile}
        className="flex w-full items-center gap-3 text-start transition-colors hover:text-brand"
      >
        <span className="relative inline-flex size-14 shrink-0 overflow-hidden rounded-full bg-white">
          {user.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photo}
              alt={avatarAlt}
              className="size-full object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center bg-brand-background-green text-brand">
              <CustomIcon src="/icons/user.svg" size={16} />
            </span>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-bold text-foreground">
            {displayName}
          </span>
          <span
            dir="ltr"
            className="text-right mt-1 block truncate text-sm font-medium text-gray-500"
          >
            {displayPhone || user.email}
          </span>
        </span>

        <ChevronLeft
          className="size-5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </button>
    </UserSheetSectionCard>
  );
}
