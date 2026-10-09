"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { useContractPeriods } from "@/features/create-contract/hooks/use-contract-periods";
import { usePaymentTypes } from "@/features/create-contract/hooks/use-payment-types";
import { useTenantRoles } from "@/features/create-contract/hooks/use-tenant-roles";
import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import type { ContractTypeId } from "@/features/create-contract/types/contract-type";
import { toPropertyContractType } from "@/features/create-contract/types/contract-type";
import {
  deedTypeIsAdversePossession,
  deedTypeIsDeceasedOwner,
  deedTypeIsEconomicCitiesAuthority,
  deedTypeIsLeaseRenewal,
  deedTypeIsPaper,
  deedTypeIsSalePaper,
  deedTypeIsWaqfOwner,
  type DeedTypeId,
} from "@/features/create-contract/types/deed-type";
import { getFilledOtherConditions } from "@/features/create-contract/types/finance-step";
import type { BirthDateValue } from "@/features/create-contract/types/owner-step";
import type {
  CreateContractReviewAttachment,
  CreateContractReviewField,
  CreateContractReviewOrderSummary,
  CreateContractReviewSection,
} from "@/features/create-contract/types/create-contract-review-order";
import { isRentedUnitDataComplete } from "@/features/create-contract/types/rented-unit-step";
import { isOrganizationTenantStatus } from "@/features/create-contract/types/tenant-step";
import { resolveContractAssetUrl } from "@/features/create-contract/utils/build-existing-contract-draft";
import { isOwnerStepSkipped } from "@/features/create-contract/utils/is-owner-step-skipped";
import { isSubleaseContract } from "@/features/create-contract/utils/is-sublease-contract";
import { formatContractDurationLabel } from "@/features/create-contract/utils/format-contract-duration-label";
import { resolveFinanceDurationMonths } from "@/features/create-contract/utils/resolve-finance-duration-months";
import { getTenantRoleTitle } from "@/features/create-contract/utils/tenant-role-helpers";
import {
  useUnitTypeOptions,
  useUnitUsageOptions,
} from "@/features/create-unit/hooks/use-unit-lookup-options";
import { isManualDeedEntryComplete } from "@/features/shared/types/manual-deed-entry";
import { persistedToFiles, type PersistedFile } from "@/lib/storage/persisted-files";
import { digitsOnly } from "@/lib/utils/digits";
import { convertToOtherCalendar, formatDateParts } from "@/lib/utils/hijri";

type ReviewDialogLabels = CreateContractLabels["payment"]["reviewDialog"];

type DeedAttachmentLabels = {
  label: string;
  salePaperLabel?: string;
  frontLabel?: string;
  backLabel?: string;
  inheritanceLabel?: string;
  heirsPoaLabel?: string;
  endowmentCertLabel?: string;
  trusteeshipLabel?: string;
  guardiansPoaLabel?: string;
  deceasedDeedLabel?: string;
  paperLabel?: string;
  adversePossessionLabel?: string;
  economicCitiesLabel?: string;
};

function hasValue(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim() !== "";
}

/** Push a label/value row only when there is a value (no empty «—» rows). */
function pushField(
  fields: CreateContractReviewField[],
  label: string,
  value: string | null | undefined,
  extra?: Partial<CreateContractReviewField>,
) {
  if (!hasValue(value)) {
    return false;
  }

  fields.push({ label, value: value.trim(), ...extra });
  return true;
}

function isBirthDateFilled(value: BirthDateValue) {
  return Boolean(value.day && value.month && value.year);
}

function formatBirthDate(
  value: BirthDateValue,
  calendarLabels: ReviewDialogLabels["calendar"],
): string | null {
  if (!isBirthDateFilled(value)) {
    return null;
  }

  const calendar =
    value.calendarType === "hijri" ? calendarLabels.hijri : calendarLabels.gregorian;

  return `${Number(digitsOnly(value.day))}/${Number(digitsOnly(value.month))}/${digitsOnly(value.year)} (${calendar})`;
}

/** Start date as typed plus the other calendar's equivalent for clarity. */
function formatStartDate(
  value: BirthDateValue,
  calendarLabels: ReviewDialogLabels["calendar"],
): string | null {
  const typed = formatBirthDate(value, calendarLabels);
  if (!typed) {
    return null;
  }

  const other = convertToOtherCalendar(value);
  if (!other) {
    return typed;
  }

  const otherCalendar =
    other.calendar === "hijri" ? calendarLabels.hijri : calendarLabels.gregorian;

  return `${typed} ≈ ${formatDateParts(other)} (${otherCalendar})`;
}

function isImageFile(name: string, type?: string) {
  if (type && type.startsWith("image/")) {
    return true;
  }

  return /\.(png|jpe?g|webp|gif|bmp|heic)$/i.test(name);
}

function resolveFiles(files: File[], persisted: PersistedFile[]): File[] {
  if (files.length > 0 && files[0] instanceof File) {
    return files;
  }

  return persistedToFiles(persisted);
}

function pushAttachments(
  attachments: CreateContractReviewAttachment[],
  args: {
    files: File[];
    persisted?: PersistedFile[];
    remoteUrl?: string | null;
    label: string;
  },
) {
  const files = resolveFiles(args.files, args.persisted ?? []);

  if (files.length > 0) {
    files.forEach((file, index) => {
      attachments.push({
        label:
          files.length > 1 ? `${args.label} (${index + 1}/${files.length})` : args.label,
        fileName: file.name,
        size: file.size,
        isImage: isImageFile(file.name, file.type),
        file,
      });
    });
    return true;
  }

  const resolved = resolveContractAssetUrl(args.remoteUrl);
  if (!resolved) {
    return false;
  }

  const fileName = decodeURIComponent(resolved.split("?")[0].split("/").pop() ?? "");
  attachments.push({
    label: args.label,
    fileName: fileName || args.label,
    size: null,
    isImage: isImageFile(fileName),
    remoteUrl: resolved,
  });
  return true;
}

function buildManualAddressValue(manual: {
  neighborhood: string;
  street: string;
  buildingNumber: string;
  postalCode: string;
  extraFigure: string;
}): string {
  return [
    manual.neighborhood,
    manual.street,
    manual.buildingNumber,
    manual.postalCode,
    manual.extraFigure,
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join("، ");
}

export function useContractReviewOrderSummary(
  labels: ReviewDialogLabels,
  contractType: ContractTypeId,
  deedTypeLabels: Record<DeedTypeId, string>,
  deedAttachmentLabels: DeedAttachmentLabels,
): CreateContractReviewOrderSummary {
  const t = useTranslations("createContract.review");
  const propertyContractType = toPropertyContractType(contractType);
  const contractPeriodsQuery = useContractPeriods(propertyContractType);
  const paymentTypesQuery = usePaymentTypes(propertyContractType);
  const unitTypesQuery = useUnitTypeOptions(propertyContractType);
  const unitUsageQuery = useUnitUsageOptions(propertyContractType);
  const tenantRolesQuery = useTenantRoles();

  const contractSession = useCreateContractDraftStore((state) => state.contractSession);
  const contractStep1Data = useCreateContractDraftStore((state) => state.contractStep1Data);
  const contractStep2Data = useCreateContractDraftStore((state) => state.contractStep2Data);
  const existingPropertyImage = useCreateContractDraftStore(
    (state) => state.existingPropertyContext?.property.image_instrument,
  );
  const deed = useCreateContractDraftStore((state) => state.deed);
  const owner = useCreateContractDraftStore((state) => state.owner);
  const tenant = useCreateContractDraftStore((state) => state.tenant);
  const financeData = useCreateContractDraftStore((state) => state.financeData);

  return useMemo(() => {
    const empty = labels.emptyValue;
    const selectedDeedType = deed.selectedDeedType;
    const instrumentType = contractStep1Data?.instrument_type;
    const isSublease = isSubleaseContract({ selectedDeedType, instrumentType });
    const ownerSkipped = isOwnerStepSkipped({ selectedDeedType, instrumentType });
    const isLeaseRenewal = deedTypeIsLeaseRenewal(selectedDeedType);
    const isDeceased = deedTypeIsDeceasedOwner(selectedDeedType);
    const isWaqf = deedTypeIsWaqfOwner(selectedDeedType);
    const periods = contractPeriodsQuery.data ?? [];

    const contractTypeLabel =
      contractType === "commercial"
        ? labels.contractTypeCommercial
        : labels.contractTypeResidential;

    const durationLabel = formatContractDurationLabel(financeData, periods, {
      yearsCount: labels.yearsCount,
      monthsCount: labels.monthsCount,
      oneYear: t("durationOneYear"),
      twoYears: t("durationTwoYears"),
    });
    const totalMonths = resolveFinanceDurationMonths(financeData, periods);

    const overview = {
      contractType: contractTypeLabel,
      startDate: formatStartDate(financeData.contractStartDate, labels.calendar) ?? empty,
      duration: durationLabel || empty,
    };

    const sections: CreateContractReviewSection[] = [];

    // ── 1) Deed ──────────────────────────────────────────────────────────
    {
      const fields: CreateContractReviewField[] = [];
      const attachments: CreateContractReviewAttachment[] = [];
      const deedTypeLabel =
        (selectedDeedType ? deedTypeLabels[selectedDeedType] : "") ||
        contractStep1Data?.instrument_type_trans ||
        "";

      pushField(fields, labels.fields.documentType, deedTypeLabel);

      if (deed.useManualDeedEntry && isManualDeedEntryComplete(deed.manualDeedEntry)) {
        const m = deed.manualDeedEntry;
        pushField(fields, t("fields.instrumentNumber"), m.instrumentNumber);
        pushField(
          fields,
          t("fields.instrumentDate"),
          `${m.instrumentHistoryDay}/${m.instrumentHistoryMonth}/${m.instrumentHistoryYear} (${
            m.typeInstrumentHistory === "hijri"
              ? labels.calendar.hijri
              : labels.calendar.gregorian
          })`,
        );
      }

      if (isDeceased) {
        pushField(
          fields,
          t("fields.minorHeirs"),
          deed.hasMinorHeirs ? t("yes") : t("no"),
        );
      }

      if (isWaqf) {
        pushField(
          fields,
          t("fields.multipleTrustees"),
          deed.isMultipleTrusteeshipDeedCopy ? t("yes") : t("no"),
        );
      }

      const mainDeedLabel = isLeaseRenewal
        ? labels.fields.leaseRenewalAttachment
        : deedTypeIsSalePaper(selectedDeedType)
          ? deedAttachmentLabels.salePaperLabel || deedAttachmentLabels.label
          : isDeceased
            ? deedAttachmentLabels.deceasedDeedLabel || deedAttachmentLabels.label
            : deedTypeIsAdversePossession(selectedDeedType)
              ? deedAttachmentLabels.adversePossessionLabel || deedAttachmentLabels.label
              : deedTypeIsEconomicCitiesAuthority(selectedDeedType)
                ? deedAttachmentLabels.economicCitiesLabel || deedAttachmentLabels.label
                : deedTypeIsPaper(selectedDeedType)
                  ? deedAttachmentLabels.paperLabel || deedAttachmentLabels.label
                  : deedAttachmentLabels.label;

      pushAttachments(attachments, {
        files: deed.deedFiles,
        persisted: deed.deedPersistedFiles,
        remoteUrl: contractStep1Data?.image_instrument ?? existingPropertyImage,
        label: mainDeedLabel,
      });
      pushAttachments(attachments, {
        files: deed.deedFrontFiles,
        persisted: deed.deedFrontPersistedFiles,
        remoteUrl: contractStep1Data?.image_instrument_from_the_front,
        label: deedAttachmentLabels.frontLabel || deedAttachmentLabels.label,
      });
      pushAttachments(attachments, {
        files: deed.deedBackFiles,
        persisted: deed.deedBackPersistedFiles,
        remoteUrl: contractStep1Data?.image_instrument_from_the_back,
        label: deedAttachmentLabels.backLabel || deedAttachmentLabels.label,
      });
      pushAttachments(attachments, {
        files: deed.deedInheritanceFiles,
        persisted: deed.deedInheritancePersistedFiles,
        remoteUrl: contractStep1Data?.Image_inheritance_certificate,
        label: deedAttachmentLabels.inheritanceLabel || deedAttachmentLabels.label,
      });
      pushAttachments(attachments, {
        files: deed.deedHeirsPoaFiles,
        persisted: deed.deedHeirsPoaPersistedFiles,
        remoteUrl: contractStep1Data?.copy_power_of_attorney_from_heirs_to_agent,
        label: deedAttachmentLabels.heirsPoaLabel || deedAttachmentLabels.label,
      });
      pushAttachments(attachments, {
        files: deed.deedEndowmentCertFiles,
        persisted: deed.deedEndowmentCertPersistedFiles,
        remoteUrl: contractStep1Data?.copy_of_the_endowment_registration_certificate,
        label: deedAttachmentLabels.endowmentCertLabel || deedAttachmentLabels.label,
      });
      pushAttachments(attachments, {
        files: deed.deedTrusteeshipFiles,
        persisted: deed.deedTrusteeshipPersistedFiles,
        remoteUrl: contractStep1Data?.copy_of_the_trusteeship_deed,
        label: deedAttachmentLabels.trusteeshipLabel || deedAttachmentLabels.label,
      });
      pushAttachments(attachments, {
        files: deed.deedGuardiansPoaFiles,
        persisted: deed.deedGuardiansPoaPersistedFiles,
        remoteUrl: contractStep1Data?.copy_of_guardians_power_of_attorney_for_agent,
        label: deedAttachmentLabels.guardiansPoaLabel || deedAttachmentLabels.label,
      });

      const deedIncomplete =
        selectedDeedType === "" ||
        (attachments.length === 0 &&
          !(deed.useManualDeedEntry && isManualDeedEntryComplete(deed.manualDeedEntry)));

      sections.push({
        id: "deed",
        title: labels.sections.deed,
        editTarget: "deed",
        fields,
        attachments,
        incomplete: deedIncomplete,
        incompleteHint: deedIncomplete ? t("incomplete.deed") : undefined,
      });
    }

    // ── 2) National address (not for sublease) ───────────────────────────
    if (!isSublease) {
      const fields: CreateContractReviewField[] = [];
      const attachments: CreateContractReviewAttachment[] = [];
      let complete = false;

      if (isLeaseRenewal && deed.leaseRenewalAddressMode === "same") {
        pushField(fields, labels.fields.addressManual, labels.sameAddress);
        complete = true;
      } else if (deed.nationalAddressMethod === "link") {
        const link =
          deed.nationalAddressLinkUrl.trim() || contractStep2Data?.address_url?.trim() || "";
        complete = pushField(fields, labels.fields.mapsLink, link, { href: link || null });
      } else if (deed.nationalAddressMethod === "manual") {
        complete = pushField(
          fields,
          labels.fields.addressManual,
          buildManualAddressValue(deed.nationalAddressManual),
          { wide: true },
        );
      } else if (deed.nationalAddressMethod === "photo") {
        complete = pushAttachments(attachments, {
          files: deed.nationalAddressPhotoFiles,
          persisted: deed.nationalAddressPhotoPersistedFiles,
          remoteUrl: contractStep2Data?.image_address,
          label: labels.fields.addressPhoto,
        });
      }

      sections.push({
        id: "nationalAddress",
        title: labels.sections.nationalAddress,
        editTarget: "nationalAddress",
        fields,
        attachments,
        incomplete: !complete,
        incompleteHint: complete ? undefined : t("incomplete.address"),
      });
    }

    // ── 3) Owner / representative ────────────────────────────────────────
    if (!ownerSkipped) {
      const fields: CreateContractReviewField[] = [];
      const attachments: CreateContractReviewAttachment[] = [];
      const agent = owner.agentData;
      const isRepresentative = isDeceased || isWaqf;

      if (isRepresentative) {
        // Deceased / waqf: the representative's data IS the owner section.
        const idLabel = isWaqf
          ? t("fields.trusteeId")
          : t("fields.heirsAgentId");
        const phoneLabel = isWaqf
          ? t("fields.trusteePhone")
          : t("fields.heirsAgentPhone");
        const birthLabel = isWaqf
          ? t("fields.trusteeBirthDate")
          : t("fields.heirsAgentBirthDate");

        pushField(fields, idLabel, agent.idNumber);
        pushField(fields, phoneLabel, agent.phone);
        pushField(fields, birthLabel, formatBirthDate(agent.birthDate, labels.calendar));
        const hasDocument = pushAttachments(attachments, {
          files: agent.powerOfAttorneyFiles,
          persisted: owner.agentPersistedFiles,
          label: t("fields.capacityDocument"),
        });

        const complete =
          hasValue(agent.idNumber) &&
          hasValue(agent.phone) &&
          isBirthDateFilled(agent.birthDate) &&
          hasDocument;

        sections.push({
          id: "owner",
          title: isWaqf ? t("sections.waqfTrustee") : t("sections.heirsAgent"),
          editTarget: "owner",
          fields,
          attachments,
          incomplete: !complete,
          incompleteHint: complete ? undefined : t("incomplete.owner"),
        });
      } else {
        const self = owner.ownerData;
        const hasAgent = self.hasAgent === "yes";

        pushField(fields, labels.fields.ownerId, self.idNumber);
        pushField(fields, labels.fields.ownerPhone, self.phone);
        pushField(
          fields,
          labels.fields.ownerBirthDate,
          formatBirthDate(self.birthDate, labels.calendar),
        );

        let agentComplete = true;
        if (hasAgent) {
          pushField(fields, t("fields.agentId"), agent.idNumber);
          pushField(fields, t("fields.agentPhone"), agent.phone);
          pushField(
            fields,
            t("fields.agentBirthDate"),
            formatBirthDate(agent.birthDate, labels.calendar),
          );
          pushField(fields, t("fields.poaNumber"), agent.poaNumber);
          pushField(fields, t("fields.poaDate"), agent.poaDate);
          const hasPoa = pushAttachments(attachments, {
            files: agent.powerOfAttorneyFiles,
            persisted: owner.agentPersistedFiles,
            label: t("fields.poaDocument"),
          });
          agentComplete =
            hasValue(agent.idNumber) &&
            hasValue(agent.phone) &&
            isBirthDateFilled(agent.birthDate) &&
            hasValue(agent.poaNumber) &&
            hasValue(agent.poaDate) &&
            hasPoa;
        }

        const complete =
          hasValue(self.idNumber) &&
          hasValue(self.phone) &&
          isBirthDateFilled(self.birthDate) &&
          agentComplete;

        sections.push({
          id: "owner",
          title: hasAgent ? labels.sections.ownerWithAgent : labels.sections.ownerSelf,
          editTarget: "owner",
          fields,
          attachments,
          incomplete: !complete,
          incompleteHint: complete ? undefined : t("incomplete.owner"),
        });
      }
    }

    // ── 4) Tenant ────────────────────────────────────────────────────────
    {
      const fields: CreateContractReviewField[] = [];
      const attachments: CreateContractReviewAttachment[] = [];
      const tenantData = tenant.tenantData;
      const isOrganization = isOrganizationTenantStatus(tenantData.status);
      let complete: boolean;

      if (isOrganization) {
        const org = tenantData.organization;
        pushField(
          fields,
          labels.fields.tenantDelegation,
          org.delegationType ? labels.delegation[org.delegationType] : "",
        );
        pushField(fields, labels.fields.tenantUnifiedRecord, org.unifiedRecordNumber);
        pushField(fields, labels.fields.tenantOwnerId, org.ownerIdNumber);
        pushField(fields, labels.fields.tenantOwnerPhone, org.ownerPhone);
        pushField(
          fields,
          labels.fields.tenantOwnerBirthDate,
          formatBirthDate(org.ownerBirthDate, labels.calendar),
        );
        pushAttachments(attachments, {
          files: org.powerOfAttorneyFiles,
          persisted: tenant.tenantPersistedFiles,
          label: t("fields.tenantPoaDocument"),
        });
        complete =
          hasValue(org.delegationType) &&
          hasValue(org.unifiedRecordNumber) &&
          hasValue(org.ownerIdNumber) &&
          hasValue(org.ownerPhone) &&
          isBirthDateFilled(org.ownerBirthDate);
      } else {
        const individual = tenantData.individual;
        pushField(fields, labels.fields.tenantId, individual.idNumber);
        pushField(fields, labels.fields.tenantPhone, individual.phone);
        pushField(
          fields,
          labels.fields.tenantBirthDate,
          formatBirthDate(individual.birthDate, labels.calendar),
        );
        complete =
          hasValue(individual.idNumber) &&
          hasValue(individual.phone) &&
          isBirthDateFilled(individual.birthDate);
      }

      if (isLeaseRenewal && tenant.leaseRenewalAddNotes && tenant.leaseRenewalNotes.trim()) {
        pushField(fields, t("fields.leaseRenewalNotes"), tenant.leaseRenewalNotes, {
          wide: true,
        });
      }

      sections.push({
        id: "tenant",
        title: isOrganization
          ? labels.sections.tenantOrganization
          : labels.sections.tenantIndividual,
        editTarget: "tenant",
        fields,
        attachments,
        incomplete: !complete,
        incompleteHint: complete ? undefined : t("incomplete.tenant"),
      });
    }

    // ── 5) Units (with meters) ───────────────────────────────────────────
    if (isLeaseRenewal && tenant.leaseRenewalUnitMode === "same") {
      sections.push({
        id: "unit",
        title: labels.sections.unit,
        editTarget: "unit",
        fields: [{ label: labels.fields.unitType, value: labels.sameUnit }],
      });
    } else {
      const units = tenant.rentedUnits;

      units.forEach((unit, unitIndex) => {
        const fields: CreateContractReviewField[] = [];
        const unitTypeName =
          (unitTypesQuery.data ?? []).find((option) => String(option.id) === unit.unitTypeId)
            ?.name ?? "";
        const unitUsageName =
          (unitUsageQuery.data ?? []).find((option) => String(option.id) === unit.unitUsageId)
            ?.name ?? "";

        pushField(fields, labels.fields.unitType, unitTypeName);
        pushField(fields, labels.fields.unitUsage, unitUsageName);
        pushField(
          fields,
          labels.fields.floor,
          unit.floorNumber === "ground" ? t("groundFloor") : unit.floorNumber,
        );
        pushField(fields, labels.fields.unitNumber, unit.unitNumber);
        pushField(
          fields,
          labels.fields.area,
          unit.totalArea.trim() ? `${unit.totalArea} ${labels.areaUnit}` : "",
        );
        pushField(fields, labels.fields.rooms, unit.roomsCount);
        pushField(fields, labels.fields.bathrooms, unit.bathroomsCount);
        pushField(fields, labels.fields.kitchens, unit.kitchensCount);
        pushField(fields, t("fields.splitAc"), unit.splitAcCount);
        pushField(fields, t("fields.windowAc"), unit.windowAcCount);
        if (unit.kitchensCount) {
          pushField(
            fields,
            labels.fields.kitchenCabinets,
            unit.kitchenCabinetsInstalled
              ? labels.kitchenCabinets.installed
              : labels.kitchenCabinets.notInstalled,
          );
        }
        if (unit.furnished) {
          pushField(
            fields,
            t("fields.furnished"),
            unit.furnishingType === "new"
              ? t("furnishingNew")
              : unit.furnishingType === "used"
                ? t("furnishingUsed")
                : t("yes"),
          );
        }

        const meterLine = (
          enabled: boolean,
          number: string,
          registration: string,
          sharedFee: string,
        ) => {
          if (!enabled) {
            return null;
          }

          const parts = [number.trim() || null];
          if (registration === "owner") parts.push(t("meter.owner"));
          if (registration === "tenant") parts.push(t("meter.tenant"));
          if (registration === "shared") {
            const monthly = Number(digitsOnly(sharedFee)) || 0;
            parts.push(
              totalMonths && monthly > 0
                ? t("meter.sharedWithTotal", {
                    monthly: monthly.toLocaleString("en-US"),
                    months: totalMonths,
                    total: (monthly * totalMonths).toLocaleString("en-US"),
                  })
                : t("meter.shared", { monthly: monthly.toLocaleString("en-US") }),
            );
          }

          return parts.filter(Boolean).join(" — ");
        };

        pushField(
          fields,
          t("fields.electricityMeter"),
          meterLine(
            unit.addElectricityMeter,
            unit.electricityMeterNumber,
            unit.electricityMeterRegistration,
            unit.electricitySharedMonthlyFee,
          ),
          { wide: true },
        );
        pushField(
          fields,
          t("fields.waterMeter"),
          meterLine(
            unit.addWaterMeter,
            unit.waterMeterNumber,
            unit.waterMeterRegistration,
            unit.waterSharedMonthlyFee,
          ),
          { wide: true },
        );

        const complete = isRentedUnitDataComplete(unit);

        sections.push({
          id: `unit-${unitIndex}`,
          title:
            units.length > 1
              ? `${labels.sections.unit} (${unitIndex + 1})`
              : labels.sections.unit,
          editTarget: "unit",
          fields,
          incomplete: !complete,
          incompleteHint: complete ? undefined : labels.unitIncomplete,
        });
      });

      if (units.length === 0) {
        sections.push({
          id: "unit-0",
          title: labels.sections.unit,
          editTarget: "unit",
          fields: [],
          incomplete: true,
          incompleteHint: labels.unitIncomplete,
        });
      }
    }

    // ── 6) Finance (rent + terms) ────────────────────────────────────────
    {
      const fields: CreateContractReviewField[] = [];
      const paymentTypeName =
        (paymentTypesQuery.data ?? []).find((option) => option.id === financeData.paymentTypeId)
          ?.name ?? "";
      const rentDigits = digitsOnly(financeData.totalRentAmount);
      const rentAmount = rentDigits
        ? `${Number(rentDigits).toLocaleString("en-US")} ${labels.currency}`
        : "";

      pushField(fields, labels.fields.startDate, overview.startDate);
      pushField(fields, labels.fields.duration, durationLabel);
      pushField(fields, t("fields.rentAmount"), rentAmount);
      pushField(fields, labels.fields.paymentMethod, paymentTypeName);

      const roles = tenantRolesQuery.data ?? [];
      financeData.selectedTenantRoleIds.forEach((id) => {
        const role = roles.find((item) => item.id === id);
        const value = financeData.tenantRoleValues[String(id)]?.trim() ?? "";
        pushField(
          fields,
          role ? getTenantRoleTitle(role) : t("fields.tenantRole", { id }),
          value
            ? `${value}${role?.input_field_label ? ` (${role.input_field_label})` : ""}`
            : t("yes"),
        );
      });

      getFilledOtherConditions(financeData.otherConditionsList).forEach((text, index) => {
        pushField(fields, t("fields.extraCondition", { index: index + 1 }), text, {
          wide: true,
        });
      });

      const complete =
        Boolean(rentAmount) &&
        Boolean(paymentTypeName || financeData.paymentTypeId !== "") &&
        Boolean(durationLabel) &&
        isBirthDateFilled(financeData.contractStartDate);

      sections.push({
        id: "rent",
        title: labels.sections.rent,
        editTarget: "rent",
        variant: "rent",
        fields,
        incomplete: !complete,
        incompleteHint: complete ? undefined : t("incomplete.finance"),
      });
    }

    const orderNumber =
      contractSession?.serverUuid ??
      contractSession?.orderReference ??
      (contractSession?.uuid != null ? String(contractSession.uuid) : "") ??
      empty;
    const contractUuidValue =
      contractSession?.uuid != null && String(contractSession.uuid).trim() !== ""
        ? String(contractSession.uuid)
        : empty;

    const copyLines = [
      `${labels.orderNumber}: ${orderNumber || empty}`,
      `${labels.fields.contractType}: ${overview.contractType}`,
      `${labels.fields.startDate}: ${overview.startDate}`,
      `${labels.fields.duration}: ${overview.duration}`,
      ...sections.flatMap((section) => [
        section.title,
        ...section.fields.map((field) => `${field.label}: ${field.value}`),
        ...(section.attachments ?? []).map(
          (attachment) => `${attachment.label}: ${attachment.fileName}`,
        ),
      ]),
    ];

    return {
      orderNumber: orderNumber || empty,
      contractUuid: contractUuidValue,
      overview,
      sections,
      copyText: copyLines.join("\n"),
    };
  }, [
    contractPeriodsQuery.data,
    contractSession,
    contractStep1Data,
    contractStep2Data,
    contractType,
    deed,
    deedAttachmentLabels,
    deedTypeLabels,
    existingPropertyImage,
    financeData,
    labels,
    owner,
    paymentTypesQuery.data,
    t,
    tenant,
    tenantRolesQuery.data,
    unitTypesQuery.data,
    unitUsageQuery.data,
  ]);
}
