"use client";

import { useState } from "react";
import { toast } from "sonner";

import { getContractPaymentUrl } from "@/features/create-contract/services/get-contract-payment-url";
import type { ContractPaymentStatusSource } from "@/features/create-contract/services/get-contract-payment-status";
import { track } from "@/lib/analytics/track";

/**
 * The Moyasar gateway/invoice page renders in the language passed via the URL.
 * Force Arabic so the hosted payment page matches this RTL Arabic app.
 */
function withArabicPaymentLocale(paymentUrl: string) {
  try {
    const url = new URL(paymentUrl);
    // Cover the common query keys used by the hosted gateway/invoice page.
    if (!url.searchParams.has("lang")) {
      url.searchParams.set("lang", "ar");
    }
    if (!url.searchParams.has("locale")) {
      url.searchParams.set("locale", "ar");
    }
    return url.toString();
  } catch {
    return paymentUrl;
  }
}

export function useStartContractPayment() {
  const [isPaying, setIsPaying] = useState(false);

  async function startPayment(
    contractUuid: string,
    errorLabel: string,
    _source: ContractPaymentStatusSource = "contract",
  ): Promise<boolean> {
    if (isPaying || !contractUuid.trim()) {
      return false;
    }

    setIsPaying(true);

    try {
      const result = await getContractPaymentUrl(contractUuid);

      if (!result.ok) {
        toast.error(result.error || errorLabel);
        setIsPaying(false);
        return false;
      }

      // Only navigate to a real http(s) gateway URL — never a javascript:/data: URL.
      let target: URL;
      try {
        target = new URL(result.data.paymentUrl);
      } catch {
        toast.error(errorLabel);
        setIsPaying(false);
        return false;
      }
      if (target.protocol !== "https:" && target.protocol !== "http:") {
        toast.error(errorLabel);
        setIsPaying(false);
        return false;
      }

      // GTM: payment_started (value = cart amount from the server when known).
      track("payment_started", {
        order_number: String(result.data.contractUuid || contractUuid),
        value: result.data.cartAmount ?? undefined,
      });

      // Leaving the app for the gateway: keep the button disabled during the
      // redirect so a second click cannot start a duplicate payment.
      window.location.assign(withArabicPaymentLocale(target.toString()));
      return true;
    } catch {
      toast.error(errorLabel);
      setIsPaying(false);
      return false;
    }
  }

  return {
    startPayment,
    isPaying,
  };
}
