"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Building2, ClipboardList, FileText, LogOut, ShieldCheck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import CustomIcon from "@/features/shared/components/custom-icon";
import ProfileEditDialog from "@/features/auth/components/profile-edit-dialog";
import UserSheetHeader from "@/features/auth/components/user-sheet-header";
import UserSheetMenuRow from "@/features/auth/components/user-sheet-menu-row";
import UserSheetProfileSection from "@/features/auth/components/user-sheet-profile-section";
import UserSheetSectionCard from "@/features/auth/components/user-sheet-section-card";
import UserSheetSocialBar from "@/features/auth/components/user-sheet-social-bar";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useAuthStore } from "@/features/auth/stores/use-auth-store";
import { useWhatsappHref } from "@/features/settings/hooks/use-whatsapp-href";

type UserSheetProps = {
  children: ReactNode;
};

export default function UserSheet({ children }: UserSheetProps) {
  const t = useTranslations("userSheet");
  const user = useAuthStore((state) => state.user);
  const { logout, isLoading: isLoggingOut } = useLogout();
  const whatsappHref = useWhatsappHref(t("helpCenter.whatsappHref"));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  async function handleLogout() {
    // Logout always clears the local session (even if the server call fails),
    // so it resolves with ok:true — just confirm to the user.
    const response = await logout();

    toast.success(response.message || t("accountSettings.logoutSuccess"));
  }

  function handleOpenProfile() {
    setSheetOpen(false);
    window.setTimeout(() => {
      setProfileOpen(true);
    }, 150);
  }

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="flex h-full w-full max-w-md flex-col gap-0 overflow-y-auto rounded-tr-[40px] rounded-br-[40px] p-6 sm:max-w-md no-scrollbar"
        >
          <UserSheetHeader title={t("title")} closeLabel={t("close")} />

          <div className="flex flex-1 flex-col gap-4 py-4">
            {user ? (
              <UserSheetProfileSection
                user={user}
                sectionTitle={t("profile.sectionTitle")}
                avatarAlt={t("profile.avatarAlt")}
                onEditProfile={handleOpenProfile}
              />
            ) : null}

            <UserSheetSectionCard title={t("nav.sectionTitle")}>
              <UserSheetMenuRow
                label={t("nav.requests")}
                icon={<ClipboardList className="size-4 text-brand" aria-hidden="true" />}
                href={t("nav.requestsHref")}
              />
              <UserSheetMenuRow
                label={t("nav.properties")}
                icon={<Building2 className="size-4 text-brand" aria-hidden="true" />}
                href={t("nav.propertiesHref")}
              />
            </UserSheetSectionCard>

            <UserSheetSectionCard title={t("policies.sectionTitle")}>
              <UserSheetMenuRow
                label={t("policies.terms")}
                icon={<FileText className="size-4 text-brand" aria-hidden="true" />}
                href={t("policies.termsHref")}
              />
              <UserSheetMenuRow
                label={t("policies.privacy")}
                icon={<ShieldCheck className="size-4 text-brand" aria-hidden="true" />}
                href={t("policies.privacyHref")}
              />
            </UserSheetSectionCard>

            <UserSheetSectionCard title={t("helpCenter.sectionTitle")}>
              <UserSheetMenuRow
                label={t("helpCenter.whatsapp")}
                icon={<FaWhatsapp className="size-4" aria-hidden="true" />}
                href={whatsappHref}
                external
              />
            </UserSheetSectionCard>

            <UserSheetSectionCard title={t("accountSettings.sectionTitle")}>
              <UserSheetMenuRow
                label={t("accountSettings.notifications")}
                icon={
                  <CustomIcon
                    src="/icons/notification-bell.svg"
                    size={16}
                    className="text-brand"
                  />
                }
                trailing={
                  <Switch
                    dir="ltr"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                    className="data-checked:bg-brand-secondary"
                    aria-label={t("accountSettings.notifications")}
                  />
                }
              />
              <UserSheetMenuRow
                label={t("accountSettings.logout")}
                icon={<LogOut className="size-4" aria-hidden="true" />}
                onClick={handleLogout}
                isLoading={isLoggingOut}
              />
            </UserSheetSectionCard>

            <UserSheetSocialBar
              followUs={t("social.followUs")}
              youtubeLabel={t("social.youtube")}
              twitterLabel={t("social.twitter")}
              tiktokLabel={t("social.tiktok")}
            />

          </div>
        </SheetContent>
      </Sheet>

      {user ? (
        <ProfileEditDialog
          user={user}
          open={profileOpen}
          onOpenChange={setProfileOpen}
        />
      ) : null}
    </>
  );
}
