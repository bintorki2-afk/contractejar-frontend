import { resolveContractAssetUrl } from "@/features/create-contract/utils/build-existing-contract-draft";

type ImageSource = Record<string, unknown> | null | undefined;

export type ExistingDeedImages = {
  instrument: string | null;
  instrumentFront: string | null;
  instrumentBack: string | null;
  inheritance: string | null;
  heirsPoa: string | null;
  endowmentCert: string | null;
  trusteeship: string | null;
  guardiansPoa: string | null;
  address: string | null;
};

function pick(sources: ImageSource[], key: string): string | null {
  for (const source of sources) {
    const value = source?.[key];
    if (typeof value === "string" && value.trim() !== "") {
      return resolveContractAssetUrl(value);
    }
  }
  return null;
}

/**
 * دفعة هـ (W-1): الصور الحالية لخطوة الصك/العنوان. المصدر الأول سياق «عقار
 * محفوظ» (إعادة استخدام عقار)، ثم بيانات الخطوة 1/2 المحمّلة من الخادم
 * (`uncompleted-contract` — وضع التصحيح أو استكمال طلب غير مكتمل). الروابط
 * موقّعة من الخادم وتُمرَّر كما هي.
 */
export function resolveExistingDeedImages(input: {
  property?: ImageSource;
  step1?: ImageSource;
  step2?: ImageSource;
}): ExistingDeedImages {
  const instrumentSources = [input.property, input.step1, input.step2];
  const step1Sources = [input.step1];

  return {
    instrument: pick(instrumentSources, "image_instrument"),
    instrumentFront: pick(step1Sources, "image_instrument_from_the_front"),
    instrumentBack: pick(step1Sources, "image_instrument_from_the_back"),
    inheritance: pick(step1Sources, "Image_inheritance_certificate"),
    heirsPoa: pick(step1Sources, "copy_power_of_attorney_from_heirs_to_agent"),
    endowmentCert: pick(step1Sources, "copy_of_the_endowment_registration_certificate"),
    trusteeship: pick(step1Sources, "copy_of_the_trusteeship_deed"),
    guardiansPoa: pick(step1Sources, "copy_of_guardians_power_of_attorney_for_agent"),
    address: pick([input.property, input.step2], "image_address"),
  };
}
