"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import type { ContractTypeId } from "@/features/create-contract/types/contract-type";
import type { CreateContractReviewOrderSummary } from "@/features/create-contract/types/create-contract-review-order";
import { trackLead } from "@/features/analytics/utils/track";
import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import {
  buildOrderExtraSections,
  collectLabelledAttachments,
} from "@/features/create-contract/utils/build-order-extra-sections";
import { useTenantRoles } from "@/features/create-contract/hooks/use-tenant-roles";

type UseSubmitOrderArgs = {
  summary: CreateContractReviewOrderSummary;
  contractType: ContractTypeId;
};

type SubmitOrderResult = {
  ok: boolean;
  orderNumber: string;
};

/**
 * The order number must match what the customer saw in the header throughout
 * the wizard. Precedence:
 *   1. the real backend contract uuid (6-digit) when present, so it matches the
 *      dashboard for support;
 *   2. otherwise the 6-digit order reference generated when the fresh order
 *      started (the number shown in the header from the first step);
 *   3. a last-resort generated reference, only if neither exists.
 */
function resolveOrderNumber(): string {
  const session = useCreateContractDraftStore.getState().contractSession;

  const uuid = session?.uuid;
  if (uuid != null && /^\d{4,7}$/.test(String(uuid).trim())) {
    return String(uuid).trim();
  }

  const reference = session?.orderReference;
  if (reference != null && /^\d{4,7}$/.test(String(reference).trim())) {
    return String(reference).trim();
  }

  return String(Math.floor(100000 + Math.random() * 900000));
}

// Fire-and-forget: forward every attached document to the business channel,
// each captioned with what it is (deed page, PoA, national address…).
// Deliberately NOT awaited by the order flow — a failure (size, no Telegram
// config, a dropped request) degrades to the WhatsApp follow-up and never
// affects whether the order itself succeeded.
async function forwardOrderAttachments(orderNumber: string): Promise<void> {
  try {
    const attachments = collectLabelledAttachments();
    if (attachments.length === 0) {
      return;
    }

    const form = new FormData();
    form.append("orderNumber", orderNumber);
    for (const { file, label } of attachments) {
      form.append("files", file, file.name);
      form.append("labels", label);
    }

    await fetch("/api/order-attachments", { method: "POST", body: form });
  } catch {
    // Best-effort only.
  }
}

export function useSubmitOrder({ summary, contractType }: UseSubmitOrderArgs) {
  const t = useTranslations("createContract.payment.reviewDialog");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitOrderResult | null>(null);
  const tenantRolesQuery = useTenantRoles();

  async function submitOrder({
    contactWhatsapp,
  }: {
    contactWhatsapp: string;
  }): Promise<SubmitOrderResult> {
    const orderNumber = resolveOrderNumber();
    const contractTypeLabel = contractType === "residential" ? "سكني" : "تجاري";

    const overviewSection = {
      title: t("title"),
      fields: [
        {
          label: t("fields.contractType"),
          value: summary.overview.contractType,
        },
        {
          label: t("fields.startDate"),
          value: summary.overview.startDate,
        },
        {
          label: t("fields.duration"),
          value: summary.overview.duration,
        },
      ],
    };

    const payload = {
      orderNumber,
      contractType: contractTypeLabel,
      whatsappNumber: contactWhatsapp,
      sections: [
        overviewSection,
        ...summary.sections.map((section) => ({
          title: section.title,
          fields: section.fields.map((field) => ({
            label: field.label,
            value: field.value,
          })),
        })),
        // Agent/representative, deed details, tenant obligations, conditions,
        // unit extras — previously collected but never forwarded.
        ...buildOrderExtraSections(tenantRolesQuery.data ?? []),
      ],
    };

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let ok = response.ok;

      if (ok) {
        try {
          const body = (await response.json()) as { ok?: boolean };
          ok = body.ok === true;
        } catch {
          ok = false;
        }
      }

      const outcome: SubmitOrderResult = { ok, orderNumber };
      setResult(outcome);

      if (ok) {
        // Conversion signal for GTM — wired to Google Ads / Meta / TikTok /
        // X / Snap as the "generate_lead" conversion trigger.
        trackLead({ orderNumber, contractType: contractTypeLabel });

        // Best-effort: forward attached deed/document images. Isolated from the
        // order result above — the order already succeeded regardless of this.
        void forwardOrderAttachments(orderNumber);
      }

      return outcome;
    } catch {
      const outcome: SubmitOrderResult = { ok: false, orderNumber };
      setResult(outcome);
      return outcome;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    submitOrder,
    isSubmitting,
    result,
  };
}
