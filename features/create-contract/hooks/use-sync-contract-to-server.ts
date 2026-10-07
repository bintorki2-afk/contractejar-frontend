"use client";

import { useState } from "react";

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
  | { ok: false; stage: SyncContractStage; error: string };

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
  const [stage, setStage] = useState<SyncContractStage | null>(null);

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
        return { ok: false, stage: "session", error: session.error };
      }

      // 1) Contract id — reuse the server one when the draft already has it.
      setStage("start");
      let contractId = store.contractSession?.serverContractId ?? null;
      let uuid = store.contractSession?.serverUuid ?? null;

      if (!contractId || !uuid) {
        const existing = store.existingPropertyContext;
        const currentSession = store.contractSession;
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
          return { ok: false, stage: "start", error: started.error };
        }

        contractId = started.contractId;
        uuid = String(started.uuid);
        store.setServerContractIdentity({ contractId, uuid });
      }

      const deedType = deed.selectedDeedType;
      if (deedType === "") {
        return { ok: false, stage: "deed", error: "missing deed type" };
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
        return { ok: false, stage: "deed", error: step1.error };
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
          return { ok: false, stage: "address", error: step2.error };
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
        const step3 = await submitContractStep3({
          contractId,
          ownerData: owner.ownerData,
          agentData: { ...owner.agentData, powerOfAttorneyFiles: agentFiles },
          representativeMode,
        });
        if (!step3.ok) {
          return { ok: false, stage: "owner", error: step3.error };
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
        return { ok: false, stage: "tenant", error: step4.error };
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
          return { ok: false, stage: "units", error: step5.error };
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
        return { ok: false, stage: "finance", error: step6.error };
      }
      store.setContractStep6Data(step6.data);

      // 8) Contact number for tracking / account merge (best-effort).
      setStage("contact");
      void setGuestContact(contactWhatsapp);

      return { ok: true, contractId, uuid };
    } finally {
      setIsSyncing(false);
      setStage(null);
    }
  }

  return { syncContract, isSyncing, stage };
}
