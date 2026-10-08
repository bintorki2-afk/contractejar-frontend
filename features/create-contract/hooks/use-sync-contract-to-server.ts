"use client";

import { useRef, useState } from "react";

import { ensureGuestSession } from "@/features/guest-session/services/ensure-guest-session";
import { setGuestContact } from "@/features/guest-session/services/set-guest-contact";
import { startContract } from "@/features/create-contract/services/start-contract";
import { submitContractStep1 } from "@/features/create-contract/services/submit-contract-step1";
import { submitContractStep2 } from "@/features/create-contract/services/submit-contract-step2";
import { submitContractStep3 } from "@/features/create-contract/services/submit-contract-step3";
import { submitContractStep4 } from "@/features/create-contract/services/submit-contract-step4";
import { submitContractStep5 } from "@/features/create-contract/services/submit-contract-step5";
import { submitContractStep6 } from "@/features/create-contract/services/submit-contract-step6";
import { getTenantRoles } from "@/features/create-contract/services/get-tenant-roles";
import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import type { ContractTypeId } from "@/features/create-contract/types/contract-type";
import { toPropertyContractType } from "@/features/create-contract/types/contract-type";
import {
  deedTypeIsDeceasedOwner,
  deedTypeIsWaqfOwner,
} from "@/features/create-contract/types/deed-type";
import { deedTypeSupportsManualEntry } from "@/features/shared/utils/supports-manual-deed-entry";
import type { ContractStep3RepresentativeMode } from "@/features/create-contract/utils/build-contract-step3-form-data";
import { isLeaseRenewalContract } from "@/features/create-contract/utils/is-lease-renewal-contract";
import { isOwnerStepSkipped } from "@/features/create-contract/utils/is-owner-step-skipped";
import { isSubleaseContract } from "@/features/create-contract/utils/is-sublease-contract";
import { mapDeedTypeToInstrumentType } from "@/features/create-contract/utils/map-deed-type-to-instrument-type";
import { isManualDeedEntryComplete } from "@/features/shared/types/manual-deed-entry";
import { persistedToFiles, type PersistedFile } from "@/lib/storage/persisted-files";
import { MAX_SERVER_ACTION_UPLOAD_BYTES, totalBytes } from "@/lib/files/compress-image";

// One step's attachments travel in one request (Vercel: 4.5 MB max) — say so
// clearly instead of a failure the customer cannot act on.
const STEP_UPLOAD_TOO_LARGE =
  "حجم مرفقات هذه الخطوة أكبر من 4 ميجابايت مجتمعة. صوّر المستندات بدقة أقل أو أرسل ملفات PDF أصغر، ثم أعد الإرسال.";

export type SyncContractStage =
  | "session"
  | "start"
  | "deed"
  | "address"
  | "owner"
  | "tenant"
  | "units"
  | "finance"
  | "contact";

export type SyncContractResult =
  | { ok: true; contractId: number; uuid: string }
  /**
   * `status`: HTTP status of the failing call (0 = the request itself threw,
   * e.g. offline or the upload was rejected before reaching the server).
   * 4xx means the server rejected the data — the customer must fix it.
   */
  | { ok: false; stage: SyncContractStage; error: string; status: number };

function firstFile(files: File[], persisted: PersistedFile[]): File | undefined {
  if (files.length > 0 && files[0] instanceof File) {
    return files[0];
  }

  return persistedToFiles(persisted)[0];
}

function allFiles(files: File[], persisted: PersistedFile[]): File[] {
  if (files.length > 0 && files[0] instanceof File) {
    return files;
  }

  return persistedToFiles(persisted);
}

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
    const { deed, owner, tenant, financeData } = store;

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
        const started =
          existing && currentSession?.isReal
            ? await startContract({
                contract_type: toPropertyContractType(contractType),
                is_real: true,
                real_id: currentSession.realId,
                unit_ids: currentSession.unitIds,
              })
            : await startContract({
                contract_type: toPropertyContractType(contractType),
                is_real: false,
              });

        if (!started.ok) {
          return { ok: false, stage: "start", error: started.error, status: started.status };
        }

        contractId = started.contractId;
        uuid = String(started.uuid);
        store.setServerContractIdentity({ contractId, uuid });
      }

      const deedType = deed.selectedDeedType;
      if (deedType === "") {
        return { ok: false, stage: "deed", error: "missing deed type", status: 400 };
      }

      const skipState = { selectedDeedType: deedType };
      const isLeaseRenewal = isLeaseRenewalContract(skipState);
      const isSublease = isSubleaseContract(skipState);
      const isDeceased = deedTypeIsDeceasedOwner(deedType);
      const isWaqf = deedTypeIsWaqfOwner(deedType);

      // 2) Deed (step1).
      setStage("deed");
      const deedPages = allFiles(deed.deedFiles, deed.deedPersistedFiles);
      const useManual =
        deed.useManualDeedEntry &&
        deedTypeSupportsManualEntry(deedType) &&
        isManualDeedEntryComplete(deed.manualDeedEntry);

      const step1Files = [
        ...deedPages,
        firstFile(deed.deedFrontFiles, deed.deedFrontPersistedFiles),
        firstFile(deed.deedBackFiles, deed.deedBackPersistedFiles),
        isDeceased ? firstFile(deed.deedInheritanceFiles, deed.deedInheritancePersistedFiles) : undefined,
        isDeceased ? firstFile(deed.deedHeirsPoaFiles, deed.deedHeirsPoaPersistedFiles) : undefined,
        isWaqf ? firstFile(deed.deedEndowmentCertFiles, deed.deedEndowmentCertPersistedFiles) : undefined,
        isWaqf ? firstFile(deed.deedTrusteeshipFiles, deed.deedTrusteeshipPersistedFiles) : undefined,
        (isDeceased && deed.hasMinorHeirs) || (isWaqf && deed.isMultipleTrusteeshipDeedCopy)
          ? firstFile(deed.deedGuardiansPoaFiles, deed.deedGuardiansPoaPersistedFiles)
          : undefined,
      ];
      if (totalBytes(step1Files) > MAX_SERVER_ACTION_UPLOAD_BYTES) {
        return { ok: false, stage: "deed", error: STEP_UPLOAD_TOO_LARGE, status: 413 };
      }

      const step1 = await submitContractStep1({
        contractId,
        instrumentType: mapDeedTypeToInstrumentType(deedType),
        imageInstrument: deedPages[0],
        imageInstrumentPages: deedPages.length > 1 ? deedPages.slice(1) : undefined,
        imageInstrumentFront: firstFile(deed.deedFrontFiles, deed.deedFrontPersistedFiles),
        imageInstrumentBack: firstFile(deed.deedBackFiles, deed.deedBackPersistedFiles),
        imageInheritanceCertificate: isDeceased
          ? firstFile(deed.deedInheritanceFiles, deed.deedInheritancePersistedFiles)
          : undefined,
        copyPowerOfAttorneyFromHeirsToAgent: isDeceased
          ? firstFile(deed.deedHeirsPoaFiles, deed.deedHeirsPoaPersistedFiles)
          : undefined,
        copyOfTheEndowmentRegistrationCertificate: isWaqf
          ? firstFile(deed.deedEndowmentCertFiles, deed.deedEndowmentCertPersistedFiles)
          : undefined,
        copyOfTheTrusteeshipDeed: isWaqf
          ? firstFile(deed.deedTrusteeshipFiles, deed.deedTrusteeshipPersistedFiles)
          : undefined,
        isMultipleTrusteeshipDeedCopy: isWaqf ? deed.isMultipleTrusteeshipDeedCopy : undefined,
        copyOfGuardiansPowerOfAttorneyForAgent:
          (isDeceased && deed.hasMinorHeirs) || (isWaqf && deed.isMultipleTrusteeshipDeedCopy)
            ? firstFile(deed.deedGuardiansPoaFiles, deed.deedGuardiansPoaPersistedFiles)
            : undefined,
        manualDeedEntry: useManual ? deed.manualDeedEntry : undefined,
      });
      if (!step1.ok) {
        return { ok: false, stage: "deed", error: step1.error, status: step1.status };
      }
      store.setContractStep1Data(step1.data);

      // 3) National address (step2) — not for sublease, and not when a lease
      //    renewal keeps the same address.
      const sendAddress =
        !isSublease &&
        !(isLeaseRenewal && deed.leaseRenewalAddressMode === "same") &&
        deed.nationalAddressMethod !== "";

      if (sendAddress && deed.nationalAddressMethod !== "") {
        setStage("address");
        const step2 = await submitContractStep2({
          contractId,
          addressMethod: deed.nationalAddressMethod,
          latitude: deed.mapLocation.lat,
          longitude: deed.mapLocation.lng,
          imageAddress: firstFile(
            deed.nationalAddressPhotoFiles,
            deed.nationalAddressPhotoPersistedFiles,
          ),
          addressUrl: deed.nationalAddressLinkUrl.trim() || undefined,
          manualAddress: deed.nationalAddressManual,
        });
        if (!step2.ok) {
          return { ok: false, stage: "address", error: step2.error, status: step2.status };
        }
        store.setContractStep2Data(step2.data);
      }

      // 4) Owner / representative (step3) — skipped for lease renewal & sublease.
      if (!isOwnerStepSkipped(skipState)) {
        setStage("owner");
        const representativeMode: ContractStep3RepresentativeMode = isDeceased
          ? "deceased"
          : isWaqf
            ? "waqf"
            : null;
        const agentFiles = allFiles(
          owner.agentData.powerOfAttorneyFiles,
          owner.agentPersistedFiles,
        );
        if (totalBytes(agentFiles) > MAX_SERVER_ACTION_UPLOAD_BYTES) {
          return { ok: false, stage: "owner", error: STEP_UPLOAD_TOO_LARGE, status: 413 };
        }
        const step3 = await submitContractStep3({
          contractId,
          ownerData: owner.ownerData,
          agentData: { ...owner.agentData, powerOfAttorneyFiles: agentFiles },
          representativeMode,
        });
        if (!step3.ok) {
          return { ok: false, stage: "owner", error: step3.error, status: step3.status };
        }
        store.setContractStep3Data(step3.data);
      }

      // 5) Tenant (step4).
      setStage("tenant");
      const tenantData = tenant.tenantData;
      const tenantOrgFiles = allFiles(
        tenantData.organization.powerOfAttorneyFiles,
        tenant.tenantPersistedFiles,
      );
      if (totalBytes(tenantOrgFiles) > MAX_SERVER_ACTION_UPLOAD_BYTES) {
        return { ok: false, stage: "tenant", error: STEP_UPLOAD_TOO_LARGE, status: 413 };
      }
      const step4 = await submitContractStep4({
        contractId,
        tenantData: {
          ...tenantData,
          organization: {
            ...tenantData.organization,
            powerOfAttorneyFiles: tenantOrgFiles,
          },
        },
        isLeaseRenewal,
        notes:
          isLeaseRenewal && tenant.leaseRenewalAddNotes
            ? tenant.leaseRenewalNotes.trim() || undefined
            : undefined,
      });
      if (!step4.ok) {
        return { ok: false, stage: "tenant", error: step4.error, status: step4.status };
      }
      store.setContractStep4Data(step4.data);

      // 6) Units (step5) — a lease renewal keeping the same unit sends nothing.
      const sendUnits =
        tenant.rentedUnits.length > 0 &&
        !(isLeaseRenewal && (tenant.leaseRenewalUnitMode ?? "same") === "same");
      if (sendUnits) {
        setStage("units");
        const step5 = await submitContractStep5({
          contractId,
          rentedUnits: tenant.rentedUnits,
        });
        if (!step5.ok) {
          return { ok: false, stage: "units", error: step5.error, status: step5.status };
        }
        store.setContractStep5Data(step5.data);
      }

      // 7) Finance (step6).
      setStage("finance");
      let roles: Awaited<ReturnType<typeof getTenantRoles>> = [];
      try {
        roles = await getTenantRoles();
      } catch {
        // Roles are only needed to label deposit/fine; the ids still go through.
      }
      const step6 = await submitContractStep6({ contractId, financeData, roles });
      if (!step6.ok) {
        return { ok: false, stage: "finance", error: step6.error, status: step6.status };
      }
      store.setContractStep6Data(step6.data);

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
