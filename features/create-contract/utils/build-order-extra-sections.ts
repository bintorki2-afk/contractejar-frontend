import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import type { BirthDateValue } from "@/features/create-contract/types/owner-step";
import {
  deedTypeIsDeceasedOwner,
  deedTypeIsWaqfOwner,
} from "@/features/create-contract/types/deed-type";
import type { TenantRole } from "@/features/create-contract/types/tenant-role";
import { getFilledOtherConditions } from "@/features/create-contract/types/finance-step";
import { isManualDeedEntryComplete } from "@/features/shared/types/manual-deed-entry";
import { persistedToFiles, type PersistedFile } from "@/lib/storage/persisted-files";

export type OrderSection = {
  title: string;
  fields: Array<{ label: string; value: string }>;
};

export type LabelledAttachment = { file: File; label: string };

function dateLabel(value: BirthDateValue): string {
  if (!value.day || !value.month || !value.year) {
    return "";
  }

  return `${value.day}/${value.month}/${value.year} (${
    value.calendarType === "hijri" ? "هجري" : "ميلادي"
  })`;
}

function yesNo(value: boolean): string {
  return value ? "نعم" : "لا";
}

function pick(files: File[], persisted: PersistedFile[]): File[] {
  if (files.length > 0 && files[0] instanceof File) {
    return files;
  }

  return persistedToFiles(persisted);
}

/**
 * Everything the review summary leaves out but the business needs to act on
 * the order (agent/representative, deed details, tenant obligations, extra
 * conditions, unit extras, coupon). Appended to the Telegram/intake payload.
 */
export function buildOrderExtraSections(roles: TenantRole[] = []): OrderSection[] {
  const { deed, owner, tenant, financeData, paymentData } =
    useCreateContractDraftStore.getState();
  const sections: OrderSection[] = [];

  const deedType = deed.selectedDeedType;
  const isDeceased = deedTypeIsDeceasedOwner(deedType);
  const isWaqf = deedTypeIsWaqfOwner(deedType);

  // ── تفاصيل الصك ──
  const deedFields: OrderSection["fields"] = [];
  if (deed.useManualDeedEntry && isManualDeedEntryComplete(deed.manualDeedEntry)) {
    const m = deed.manualDeedEntry;
    deedFields.push(
      { label: "رقم الصك", value: m.instrumentNumber },
      {
        label: "تاريخ الصك",
        value: `${m.instrumentHistoryDay}/${m.instrumentHistoryMonth}/${m.instrumentHistoryYear} (${
          m.typeInstrumentHistory === "hijri" ? "هجري" : "ميلادي"
        })`,
      },
    );
  }
  if (isDeceased) {
    deedFields.push({ label: "يوجد ورثة قاصرون", value: yesNo(deed.hasMinorHeirs) });
  }
  if (isWaqf) {
    deedFields.push({
      label: "صك نظارة متعدد النظار",
      value: yesNo(deed.isMultipleTrusteeshipDeedCopy),
    });
  }
  if (deed.mapLocation && (deed.mapLocation.lat || deed.mapLocation.lng)) {
    deedFields.push({
      label: "الموقع على الخريطة",
      value: `https://maps.google.com/?q=${deed.mapLocation.lat},${deed.mapLocation.lng}`,
    });
  }
  if (deedFields.length > 0) {
    sections.push({ title: "تفاصيل الصك", fields: deedFields });
  }

  // ── الوكيل / الممثل القانوني ──
  const hasAgent = owner.ownerData.hasAgent === "yes" || isDeceased || isWaqf;
  if (hasAgent) {
    const a = owner.agentData;
    const title = isDeceased
      ? "وكيل الورثة"
      : isWaqf
        ? "ناظر الوقف"
        : "وكيل المالك";
    const fields: OrderSection["fields"] = [
      { label: "رقم الهوية", value: a.idNumber },
      { label: "رقم الجوال", value: a.phone },
      { label: "تاريخ الميلاد", value: dateLabel(a.birthDate) },
    ];
    if (a.poaNumber.trim()) {
      fields.push({ label: "رقم الوكالة", value: a.poaNumber.trim() });
    }
    if (a.poaDate.trim()) {
      fields.push({ label: "تاريخ الوكالة", value: a.poaDate.trim() });
    }
    const poaFiles = pick(a.powerOfAttorneyFiles, owner.agentPersistedFiles);
    fields.push({ label: "صورة الوكالة", value: poaFiles.length > 0 ? "مرفقة" : "غير مرفقة" });
    sections.push({ title, fields: fields.filter((f) => f.value !== "") });
  }

  // ── تفاصيل الوحدات الإضافية ──
  tenant.rentedUnits.forEach((unit, index) => {
    const prefix = tenant.rentedUnits.length > 1 ? `الوحدة ${index + 1} — ` : "";
    const fields: OrderSection["fields"] = [];
    if (unit.windowAcCount) {
      fields.push({ label: "مكيفات شباك", value: unit.windowAcCount });
    }
    if (unit.splitAcCount) {
      fields.push({ label: "مكيفات سبليت", value: unit.splitAcCount });
    }
    fields.push({
      label: "مؤثثة",
      value: unit.furnished ? `نعم${unit.furnishingType ? ` (${unit.furnishingType})` : ""}` : "لا",
    });
    if (unit.addElectricityMeter && unit.electricityMeterNumber) {
      fields.push({
        label: "عداد الكهرباء",
        value: `${unit.electricityMeterNumber}${
          unit.electricityMeterRegistration ? ` — باسم ${unit.electricityMeterRegistration}` : ""
        }`,
      });
    }
    if (unit.addWaterMeter && unit.waterMeterNumber) {
      fields.push({
        label: "عداد الماء",
        value: `${unit.waterMeterNumber}${
          unit.waterMeterRegistration ? ` — باسم ${unit.waterMeterRegistration}` : ""
        }`,
      });
    }
    if (fields.length > 0) {
      sections.push({ title: `${prefix}تجهيزات الوحدة`, fields });
    }
  });

  // ── التزامات المستأجر ──
  if (financeData.selectedTenantRoleIds.length > 0) {
    const byId = new Map(roles.map((role) => [role.id, role]));
    const fields = financeData.selectedTenantRoleIds.map((id) => {
      const role = byId.get(id);
      const value = financeData.tenantRoleValues[String(id)]?.trim() ?? "";
      return {
        label: role?.name ?? `بند ${id}`,
        value: value ? `${value}${role?.input_field_label ? ` (${role.input_field_label})` : ""}` : "نعم",
      };
    });
    sections.push({ title: "التزامات المستأجر", fields });
  }

  // ── الشروط الإضافية ──
  const conditions = getFilledOtherConditions(financeData.otherConditionsList);
  if (conditions.length > 0) {
    sections.push({
      title: "الشروط الإضافية",
      fields: conditions.map((text, index) => ({ label: `شرط ${index + 1}`, value: text })),
    });
  }

  // ── الكوبون ──
  const coupon = paymentData.appliedCoupon;
  if (coupon) {
    sections.push({
      title: "الخصم",
      fields: [{ label: "كود الخصم", value: String(coupon.code ?? "") }],
    });
  }

  return sections;
}

/** Every document attached in the wizard, with a human label for the caption. */
export function collectLabelledAttachments(): LabelledAttachment[] {
  const { deed, owner, tenant } = useCreateContractDraftStore.getState();
  const out: LabelledAttachment[] = [];

  const add = (files: File[], persisted: PersistedFile[], label: string) => {
    const resolved = pick(files, persisted);
    resolved.forEach((file, index) => {
      out.push({
        file,
        label: resolved.length > 1 ? `${label} (${index + 1}/${resolved.length})` : label,
      });
    });
  };

  add(deed.deedFiles, deed.deedPersistedFiles, "صورة الصك");
  add(deed.deedFrontFiles, deed.deedFrontPersistedFiles, "الصك — الوجه الأمامي");
  add(deed.deedBackFiles, deed.deedBackPersistedFiles, "الصك — الوجه الخلفي");
  add(deed.deedInheritanceFiles, deed.deedInheritancePersistedFiles, "صك حصر الورثة");
  add(deed.deedHeirsPoaFiles, deed.deedHeirsPoaPersistedFiles, "وكالة الورثة للوكيل");
  add(deed.deedEndowmentCertFiles, deed.deedEndowmentCertPersistedFiles, "شهادة تسجيل الوقف");
  add(deed.deedTrusteeshipFiles, deed.deedTrusteeshipPersistedFiles, "صك النظارة");
  add(deed.deedGuardiansPoaFiles, deed.deedGuardiansPoaPersistedFiles, "وكالة الأوصياء / النظار");
  add(deed.nationalAddressPhotoFiles, deed.nationalAddressPhotoPersistedFiles, "العنوان الوطني");
  add(owner.agentData.powerOfAttorneyFiles, owner.agentPersistedFiles, "وكالة المالك");
  add(
    tenant.tenantData.organization.powerOfAttorneyFiles,
    tenant.tenantPersistedFiles,
    "تفويض المنشأة (المستأجر)",
  );

  return out;
}
