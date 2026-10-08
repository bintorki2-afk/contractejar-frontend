"use client";

import { useState } from "react";

import { logoutUser } from "@/features/auth/services/logout-user";
import { useAuthStore } from "@/features/auth/stores/use-auth-store";

export function useLogout() {
  const clearUser = useAuthStore((state) => state.clearUser);
  const [isLoading, setIsLoading] = useState(false);

  async function logout() {
    setIsLoading(true);

    try {
      // Best-effort server logout; never block the local sign-out on a 5xx/network error.
      const response = await logoutUser().catch(() => null);

      clearUser();

      // Clear in-progress drafts (they hold ID numbers, IBANs and deed images)
      // so they never leak to the next person on a shared device.
      try {
        [
          "aqdi-create-contract-draft",
          "aqdi-create-property-draft",
          "aqdi-create-unit-draft",
          "aqdi-auth-user",
          "aqdi-notifications-inbox",
        ].forEach((key) => localStorage.removeItem(key));
      } catch {
        // localStorage may be unavailable (private mode) — ignore.
      }

      // Full reload, not router.push: the drafts above also live in memory
      // (zustand); a client-side navigation kept the previous customer's
      // wizard (IDs, phones, deed) on screen and persisted it again.
      window.location.assign("/login");

      return {
        ok: true as const,
        message: response?.message,
      };
    } finally {
      setIsLoading(false);
    }
  }

  return {
    logout,
    isLoading,
  };
}
