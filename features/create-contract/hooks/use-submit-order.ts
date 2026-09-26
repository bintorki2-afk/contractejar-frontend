"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import type { ContractTypeId } from "@/features/create-contract/types/contract-type";
import type { CreateContractReviewOrderSummary } from "@/features/create-contract/types/create-contract-review-order";
import { trackLead } from "@/features/analytics/utils/track";
import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import { persistedToFiles, type PersistedFile } from "@/lib/storage/persisted-files";

type UseSubmitOrderArgs = {
  summary: CreateContractReviewOrderSummary;
  contractType: ContractTypeId;
};

type SubmitOrderResult = {
  ok: boolean;
  orderNumber: string;
};

/**
 * The order number shown to the customer must match the 6-digit number in the
 * dashboard (the backend contract uuid), so support can match them. Use that
 * real number; only fall back to a generated reference if it isn't available.
 */
function resolveOrderNumber(): string {
  const uuid = useCreateContractDraftStore.getState().contractSession?.uuid;
  if (uuid != null && /^\d{4,7}$/.test(String(uuid).trim())) {
    return String(uuid).trim();
  }

  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const random = String(Math.floor(1000 + Math.random() * 9000));

  return `AQ-${yy}${mm}${dd}-${random}`;
}

// Deed / document file categories held in the draft store. Each has an
// in-memory File[] (full quality, present during a normal wizard session) and a
// persisted fallback (small copies restored after a page reload).
const DEED_FILE_FIELDS: ReadonlyArray<readonly [string, string]> = [
  ["deedFiles", "deedPersistedFiles"],
  ["deedFrontFiles", "deedFrontPersistedFiles"],
  ["deedBackFiles", "deedBackPersistedFiles"],
  ["deedInheritanceFiles", "deedInheritancePersistedFiles"],
  ["deedHeirsPoaFiles", "deedHeirsPoaPersistedFiles"],
  ["deedEndowmentCertFiles", "deedEndowmentCertPersistedFiles"],
  ["deedTrusteeshipFiles", "deedTrusteeshipPersistedFiles"],
  ["deedGuardiansPoaFiles", "deedGuardiansPoaPersistedFiles"],
  ["nationalAddressPhotoFiles", "nationalAddressPhotoPersistedFiles"],
];

function collectDeedFiles(): File[] {
  const deed = useCreateContractDraftStore.getState().deed as unknown as Record<
    string,
    unknown
  >;

  const collected: File[] = [];

  for (const [filesKey, persistedKey] of DEED_FILE_FIELDS) {
    const inMemory = deed?.[filesKey];
    if (
      Array.isArray(inMemory) &&
      inMemory.length > 0 &&
      inMemory[0] instanceof File
    ) {
      collected.push(...(inMemory as File[]));
      continue;
    }

    const persisted = deed?.[persistedKey];
    if (Array.isArray(persisted) && persisted.length > 0) {
      collected.push(...persistedToFiles(persisted as PersistedFile[]));
    }
  }

  return collected;
}

// Fire-and-forget: forward attached document images to the business channel.
// Deliberately NOT awaited by the order flow — a failure (size, no Telegram
// config, a dropped request) degrades to the WhatsApp follow-up and never
// affects whether the order itself succeeded.
async function forwardDeedAttachments(orderNumber: string): Promise<void> {
  try {
    const files = collectDeedFiles();
    if (files.length === 0) {
      return;
    }

    const form = new FormData();
    form.append("orderNumber", orderNumber);
    for (const file of files) {
      form.append("files", file, file.name);
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
        void forwardDeedAttachments(orderNumber);
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
