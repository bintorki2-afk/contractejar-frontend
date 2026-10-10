"use client";

import { useRef, useState } from "react";

import { ensureGuestSession } from "@/features/guest-session/services/ensure-guest-session";
import { setGuestContact } from "@/features/guest-session/services/set-guest-contact";
import { startContract } from "@/features/create-contract/services/start-contract";
import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import type { ContractTypeId } from "@/features/create-contract/types/contract-type";
import { toPropertyContractType } from "@/features/create-contract/types/contract-type";
import {
  STEP_SYNCERS,
  type SyncContractStage,
} from "@/features/create-contract/utils/sync-contract-steps";

export type { SyncContractStage } from "@/features/create-contract/utils/sync-contract-steps";

export type SyncContractResult =
  | { ok: true; contractId: number; uuid: string }
  /**
   * `status`: HTTP status of the failing call (0 = the request itself threw,
   * e.g. offline or the upload was rejected before reaching the server).
   * 4xx means the server rejected the data — the customer must fix it.
   */
  | { ok: false; stage: SyncContractStage; error: string; status: number };

/**
 * The same draft open in two tabs: tab A sends it (server contract #1 is saved
 * in localStorage), then tab B — whose in-memory draft never saw that id —
 * sent it again and created a second order (tested: 445150 + 684391). Before
 * creating a contract, adopt the server identity another tab stored for the
 * same draft (same contract type, owner and tenant ID numbers).
 */
const DRAFT_STORAGE_KEY = "aqdi-create-contract-draft";

function adoptServerIdentityFromOtherTab(rawValue?: string | null) {
  const store = useCreateContractDraftStore.getState();
  if (store.contractSession?.serverContractId || typeof window === "undefined") {
    return;
  }

  try {
    const raw = rawValue ?? window.localStorage.getItem(DRAFT_STORAGE_KEY);
    const persisted = raw ? JSON.parse(raw)?.state : null;
    const session = persisted?.contractSession;
    if (!session?.serverContractId || !session?.serverUuid) {
      return;
    }

    const sameDraft =
      session.contractType === store.contractSession?.contractType &&
      persisted?.owner?.ownerData?.idNumber === store.owner.ownerData.idNumber &&
      persisted?.tenant?.tenantData?.individual?.idNumber ===
        store.tenant.tenantData.individual.idNumber &&
      persisted?.tenant?.tenantData?.organization?.unifiedRecordNumber ===
        store.tenant.tenantData.organization.unifiedRecordNumber;

    if (sameDraft) {
      store.setServerContractIdentity({
        contractId: Number(session.serverContractId),
        uuid: String(session.serverUuid),
      });
    }
  } catch {
    // Unreadable storage: fall back to creating the contract as before.
  }
}

// Tab B overwrites localStorage with its own copy on its next edit (e.g. the
// OTP dialog storing the mobile), so catch tab A's write the moment it happens.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === DRAFT_STORAGE_KEY && event.newValue) {
      adoptServerIdentityFromOtherTab(event.newValue);
    }
  });
}

/**
 * Draft-first stays: the whole wizard is filled offline in the browser. This
 * hook replays the finished draft onto the backend in one go (start →
 * step1…6) so a real contract exists for payment, tracking and the dashboard.
 *
 * Idempotent: a draft that already has a server contract re-sends the steps on
 * the same id (every step is an update), so editing after a failed payment
 * does not create a second order.
 */
export function useSyncContractToServer(contractType: ContractTypeId) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [stage, setStageState] = useState<SyncContractStage | null>(null);
  const stageRef = useRef<SyncContractStage | null>(null);
  function setStage(next: SyncContractStage | null) {
    stageRef.current = next;
    setStageState(next);
  }

  async function syncContract({
    contactWhatsapp,
  }: {
    contactWhatsapp: string;
  }): Promise<SyncContractResult> {
    const store = useCreateContractDraftStore.getState();

    setIsSyncing(true);

    try {
      // 0) Session (customer or guest).
      setStage("session");
      const session = await ensureGuestSession();
      if (!session.ok) {
        return { ok: false, stage: "session", error: session.error, status: 503 };
      }

      // 1) Contract id — reuse the server one when the draft already has it.
      setStage("start");
      adoptServerIdentityFromOtherTab();
      const current = useCreateContractDraftStore.getState();
      let contractId = current.contractSession?.serverContractId ?? null;
      let uuid = current.contractSession?.serverUuid ?? null;

      if (!contractId || !uuid) {
        const existing = current.existingPropertyContext;
        const currentSession = current.contractSession;
        // Stable for this draft until the server id replaces it (WEBSITE-3).
        const idempotencyKey = currentSession
          ? `web-${currentSession.contractId}-${currentSession.orderReference ?? ""}`
          : undefined;
        const started =
          existing && currentSession?.isReal
            ? await startContract({
                contract_type: toPropertyContractType(contractType),
                is_real: true,
                real_id: currentSession.realId,
                unit_ids: currentSession.unitIds,
              }, idempotencyKey)
            : await startContract({
                contract_type: toPropertyContractType(contractType),
                is_real: false,
              }, idempotencyKey);

        if (!started.ok) {
          return { ok: false, stage: "start", error: started.error, status: started.status };
        }

        contractId = started.contractId;
        uuid = String(started.uuid);
        store.setServerContractIdentity({ contractId, uuid });
      }

      // 2..7) Deed → address → owner → tenant → units → finance (shared with
      // the fix mode of دفعة هـ, which sends one of these on its own).
      const stages: Array<[SyncContractStage, number]> = [
        ["deed", 1],
        ["address", 2],
        ["owner", 3],
        ["tenant", 4],
        ["units", 5],
        ["finance", 6],
      ];
      for (const [stageName, stepNumber] of stages) {
        setStage(stageName);
        const outcome = await STEP_SYNCERS[stepNumber](useCreateContractDraftStore.getState(), contractId);
        if (!outcome.ok) {
          return { ok: false, stage: outcome.stage, error: outcome.error, status: outcome.status };
        }
      }

      // 8) Contact number for tracking / account merge (best-effort).
      setStage("contact");
      void setGuestContact(contactWhatsapp);

      return { ok: true, contractId, uuid };
    } catch {
      // A server action that throws (connection dropped, request body rejected
      // by the host before reaching the app) used to escape as an unhandled
      // rejection: the button reset silently with no message.
      return {
        ok: false,
        stage: stageRef.current ?? "session",
        error: "",
        status: 0,
      };
    } finally {
      setIsSyncing(false);
      setStage(null);
    }
  }

  return { syncContract, isSyncing, stage };
}
