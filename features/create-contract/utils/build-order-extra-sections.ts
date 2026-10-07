import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import type { ContractPeriodOption } from "@/features/create-contract/types/contract-period";
import { mapDeedTypeToInstrumentType } from "@/features/create-contract/utils/map-deed-type-to-instrument-type";
import { resolveFinanceDurationMonths } from "@/features/create-contract/utils/resolve-finance-duration-months";
import type { PropertyContractType } from "@/features/create-property/utils/contract-type";
import {
  computeContractFee,
  FALLBACK_CONTRACT_PRICING,
  getMeterTransferFee,
  getPricingTier,
  instrumentTypeHasSurcharge,
  type ContractPricing,
} from "@/features/pricing/types/contract-pricing";
import { persistedToFiles, type PersistedFile } from "@/lib/storage/persisted-files";
import { digitsOnly } from "@/lib/utils/digits";

export type OrderSection = {
  title: string;
  fields: Array<{ label: string; value: string }>;
};

export type LabelledAttachment = { file: File; label: string };

function pick(files: File[], persisted: PersistedFile[]): File[] {
  if (files.length > 0 && files[0] instanceof File) {
    return files;
  }

  return persistedToFiles(persisted);
}

/**
 * Everything the review summary leaves out but the business needs to act on
 * the order: the fee breakdown (duration rule + document surcharge + meter
 * transfer fees), shared-meter contract terms, map location and coupon.
 * Owner/agent, units, tenant obligations and extra conditions already come
 * through the review sections. Appended to the Telegram/intake payload.
 */
export function buildOrderExtraSections(
  pricing: ContractPricing = FALLBACK_CONTRACT_PRICING,
  periods: ContractPeriodOption[] = [],
): OrderSection[] {
  const { deed, tenant, financeData, paymentData, contractSession } =
    useCreateContractDraftStore.getState();
  const sections: OrderSection[] = [];
  const contractType: PropertyContractType =
    contractSession?.contractType ?? "housing";

  // ── الموقع على الخريطة ──
  if (deed.mapLocation && (deed.mapLocation.lat || deed.mapLocation.lng)) {
    sections.push({
      title: "تفاصيل الصك",
      fields: [
        {
          label: "الموقع على الخريطة",
          value: `https://maps.google.com/?q=${deed.mapLocation.lat},${deed.mapLocation.lng}`,
        },
      ],
    });
  }

  // ── الرسوم (تقديرية حسب لائحة الأسعار) ──
  const feeFields: OrderSection["fields"] = [];
  const totalMonths = resolveFinanceDurationMonths(financeData, periods);
  const tier = getPricingTier(pricing, contractType);
  let estimatedTotal = 0;

  if (totalMonths !== null) {
    const { billableYears, fee } = computeContractFee(tier, totalMonths);
    estimatedTotal += fee;
    feeFields.push({
      label: "رسوم التوثيق",
      value: `${fee} ريال (${totalMonths} شهر = ${billableYears} سنة محاسبية)`,
    });
  }

  const deedType = deed.selectedDeedType;
  const surchargeApplies =
    deedType !== "" &&
    instrumentTypeHasSurcharge(pricing, mapDeedTypeToInstrumentType(deedType));
  if (surchargeApplies) {
    estimatedTotal += pricing.document_surcharge.fee;
    feeFields.push({
      label: "رسوم المستندات الإضافية",
      value: `${pricing.document_surcharge.fee} ريال (مرة واحدة)`,
    });
  }

  let meterTransferTotal = 0;
  tenant.rentedUnits.forEach((unit) => {
    if (unit.addElectricityMeter && unit.electricityMeterRegistration === "tenant") {
      meterTransferTotal += getMeterTransferFee(pricing, contractType, "electricity");
    }
    if (unit.addWaterMeter && unit.waterMeterRegistration === "tenant") {
      meterTransferTotal += getMeterTransferFee(pricing, contractType, "water");
    }
  });
  if (meterTransferTotal > 0) {
    estimatedTotal += meterTransferTotal;
    feeFields.push({
      label: "رسوم نقل العدادات باسم المستأجر",
      value: `${meterTransferTotal} ريال`,
    });
  }

  if (feeFields.length > 0) {
    feeFields.push({
      label: "الإجمالي التقديري",
      value: `${estimatedTotal} ريال (الإجمالي النهائي من الخادم)`,
    });
    sections.push({ title: "الرسوم", fields: feeFields });
  }

  // ── بنود العداد المشترك (يدفعها المستأجر للمالك — ليست من رسومنا) ──
  const sharedFields: OrderSection["fields"] = [];
  tenant.rentedUnits.forEach((unit, index) => {
    const prefix = tenant.rentedUnits.length > 1 ? `الوحدة ${index + 1} — ` : "";
    const line = (label: string, fee: string) => {
      const monthly = Number(digitsOnly(fee)) || 0;
      if (monthly <= 0) {
        return;
      }
      sharedFields.push({
        label: `${prefix}${label}`,
        value:
          totalMonths !== null
            ? `${monthly} ريال/شهر × ${totalMonths} شهر = ${monthly * totalMonths} ريال`
            : `${monthly} ريال/شهر`,
      });
    };
    if (unit.addElectricityMeter && unit.electricityMeterRegistration === "shared") {
      line("عداد الكهرباء المشترك", unit.electricitySharedMonthlyFee);
    }
    if (unit.addWaterMeter && unit.waterMeterRegistration === "shared") {
      line("عداد المياه المشترك", unit.waterSharedMonthlyFee);
    }
  });
  if (sharedFields.length > 0) {
    sections.push({ title: "بنود العداد المشترك (بند في العقد)", fields: sharedFields });
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
