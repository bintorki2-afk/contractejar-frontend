import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getTranslations } from "next-intl/server";

import type { CreateContractFixParams } from "@/features/create-contract/components/create-contract-fix-mode";
import CreateContractPageContent from "@/features/create-contract/components/create-contract-page-content";
import { parseFixParam, parseStepParam } from "@/features/requests/utils/parse-fix-param";
import {
  contractPaperworkKeys,
  contractPaymentTypeKeys,
} from "@/features/create-contract/query-keys";
import { getPaperwork } from "@/features/create-contract/services/get-paperwork";
import { getPaymentTypes } from "@/features/create-contract/services/get-payment-types";
import { contractPricingKeys } from "@/features/pricing/query-keys";
import { getContractPricing } from "@/features/pricing/services/get-contract-pricing";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import {
  toPropertyContractType,
  type ContractTypeId,
} from "@/features/create-contract/types/contract-type";
import { DEED_TYPES } from "@/features/create-contract/types/deed-type";
import { settingContractsKeys } from "@/features/shared/query-keys";
import { getSettingContracts } from "@/features/shared/services/get-setting-contracts";
import { getWhatsappHref } from "@/features/settings/services/get-whatsapp-href";
import { DEFAULT_CONTACT_NUMBER } from "@/features/settings/utils/build-whatsapp-href";
import { getQueryClient } from "@/lib/react-query/get-query-client";
import {
  DELEGATION_TYPE_OPTIONS,
  TENANT_STATUS_OPTIONS,
} from "@/features/create-contract/types/tenant-step";

type CreateContractPageProps = {
  /** `fix` / `order` / `cid` / `step`: دفعة هـ (E4) — وضع التصحيح لطلب مدفوع. */
  searchParams: Promise<{ id?: string; fix?: string; order?: string; cid?: string; step?: string }>;
};

export async function generateMetadata({
  searchParams,
}: CreateContractPageProps): Promise<Metadata> {
  const [{ id }, t] = await Promise.all([searchParams, getTranslations("createContract")]);
  return {
    title: id === "commercial" ? t("pageTitleCommercial") : t("pageTitleResidential"),
  };
}

export default async function CreateContractPage({
  searchParams,
}: CreateContractPageProps) {
  const { id, fix, order, cid, step } = await searchParams;
  const contractType: ContractTypeId =
    id === "residential" ? "residential" : "commercial";
  const fixRequestId = parseFixParam(fix);
  const fixContractId = parseFixParam(cid);
  const fixOrder = (order ?? "").replace(/[^0-9A-Za-z-]/g, "").slice(0, 64);
  const fixParams: CreateContractFixParams | null =
    fixRequestId != null && fixContractId != null && fixOrder
      ? { requestId: fixRequestId, contractId: fixContractId, orderUuid: fixOrder, step: parseStepParam(step) }
      : null;

  const queryClient = getQueryClient();
  const propertyContractType = toPropertyContractType(contractType);

  // The order flow no longer requires a live backend: a failing read must not
  // crash the page, so each prefetch (and the WhatsApp lookup) swallows errors
  // and falls back to its default. The client read hooks refetch as needed.
  const [t, whatsappHref] = await Promise.all([
    getTranslations("createContract"),
    getWhatsappHref().catch(() => `https://wa.me/${DEFAULT_CONTACT_NUMBER}`),
    queryClient
      .prefetchQuery({
        queryKey: contractPaperworkKeys.list(propertyContractType),
        queryFn: () => getPaperwork(propertyContractType),
      })
      .catch(() => undefined),
    queryClient
      .prefetchQuery({
        queryKey: contractPricingKeys.detail(),
        queryFn: () => getContractPricing(),
      })
      .catch(() => undefined),
    queryClient
      .prefetchQuery({
        queryKey: contractPaymentTypeKeys.list(propertyContractType),
        queryFn: () => getPaymentTypes(propertyContractType),
      })
      .catch(() => undefined),
    queryClient
      .prefetchQuery({
        queryKey: settingContractsKeys.list(),
        queryFn: () => getSettingContracts(),
      })
      .catch(() => undefined),
  ]);

  const labels: CreateContractLabels = {
    backLabel: t("backLabel"),
    pageTitleResidential: t("pageTitleResidential"),
    pageTitleCommercial: t("pageTitleCommercial"),
    header: {
      home: t("header.home"),
      help: t("header.help"),
      dark: t("header.dark"),
      light: t("header.light"),
      requestPrefix: t("header.requestPrefix"),
      copySuccess: t("header.copySuccess"),
      copyError: t("header.copyError"),
      whatsappHref,
      exitHomeDialog: {
        title: t("header.exitHomeDialog.title"),
        close: t("header.exitHomeDialog.close"),
        incompleteTitle: t("header.exitHomeDialog.incompleteTitle", {
          orderNumber: "—",
        }),
        description: t("header.exitHomeDialog.description"),
        saveThenExit: t("header.exitHomeDialog.saveThenExit"),
        saving: t("header.exitHomeDialog.saving"),
        exitWithoutSaving: t("header.exitHomeDialog.exitWithoutSaving"),
        exitingWithoutSaving: t("header.exitHomeDialog.exitingWithoutSaving"),
        continue: t("header.exitHomeDialog.continue"),
        saveError: t("header.exitHomeDialog.saveError"),
        missingContractSession: t("header.exitHomeDialog.missingContractSession"),
      },
    },
    stepper: {
      journey: t("stepper.journey"),
      ejarLogoAlt: t("stepper.ejarLogoAlt"),
      steps: {
        intro: t("stepper.steps.intro"),
        deed: t("stepper.steps.deed"),
        owner: t("stepper.steps.owner"),
        tenant: t("stepper.steps.tenant"),
        finance: t("stepper.steps.finance"),
      },
    },
    intro: {
      title: t("intro.title"),
      subtitle: t("intro.subtitle"),
      requirements: t.raw("intro.requirements") as string[],
      priceLabel: t("intro.priceLabel"),
      currency: t("intro.currency"),
      viewAllPrices: t("intro.viewAllPrices"),
      start: t("intro.start"),
      startContractLoading: t("intro.startContractLoading"),
      startContractError: t("intro.startContractError"),
      priceDialog: {
        title: t("intro.priceDialog.title"),
        close: t("intro.priceDialog.close"),
        yearOrLess: t("intro.priceDialog.yearOrLess", {
          price: t(`prices.${contractType}`),
        }),
        additionalYear: t("intro.priceDialog.additionalYear", {
          price: t("prices.additionalYear"),
        }),
        disclaimer: t("intro.priceDialog.disclaimer"),
      },
    },
    deed: {
      navigation: {
        previous: t("deed.navigation.previous"),
        continue: t("deed.navigation.continue"),
        submitting: t("deed.navigation.submitting"),
      },
      submitError: t("deed.submitError"),
      submitAddressError: t("deed.submitAddressError"),
      missingContractSession: t("deed.missingContractSession"),
      phases: t.raw("deed.phases") as CreateContractLabels["deed"]["phases"],
      deedType: {
        label: t("deed.deedType.label"),
        placeholder: t("deed.deedType.placeholder"),
        clearSelection: t("deed.deedType.clearSelection"),
        types: Object.fromEntries(
          DEED_TYPES.map((deedType) => [
            deedType,
            t(`deed.deedType.types.${deedType}`),
          ]),
        ) as CreateContractLabels["deed"]["deedType"]["types"],
      },
      deedImage: {
        label: t("deed.deedImage.label"),
        frontLabel: t("deed.deedImage.frontLabel"),
        backLabel: t("deed.deedImage.backLabel"),
        inheritanceLabel: t("deed.deedImage.inheritanceLabel"),
        heirsPoaLabel: t("deed.deedImage.heirsPoaLabel"),
        endowmentCertLabel: t("deed.deedImage.endowmentCertLabel"),
        trusteeshipLabel: t("deed.deedImage.trusteeshipLabel"),
        guardiansPoaLabel: t("deed.deedImage.guardiansPoaLabel"),
        salePaperLabel: t("deed.deedImage.salePaperLabel"),
        adversePossessionLabel: t("deed.deedImage.adversePossessionLabel"),
        economicCitiesLabel: t("deed.deedImage.economicCitiesLabel"),
        paperLabel: t("deed.deedImage.paperLabel"),
        clickHere: t("deed.deedImage.clickHere"),
        chooseFile: t("deed.deedImage.chooseFile"),
        acceptedFormats: t("deed.deedImage.acceptedFormats"),
        attached: t("deed.deedImage.attached"),
        preview: t("deed.deedImage.preview"),
        change: t("deed.deedImage.change"),
        delete: t("deed.deedImage.delete"),
        previewTitle: t("deed.deedImage.previewTitle"),
        closePreview: t("deed.deedImage.closePreview"),
      },
      sublease: {
        alertTitle: t("deed.sublease.alertTitle"),
        notes: t.raw("deed.sublease.notes") as string[],
        uploadLabel: t("deed.sublease.uploadLabel"),
        pdfHint: t("deed.sublease.pdfHint"),
      },
      nationalAddress: {
        methodSelect: {
          label: t("deed.nationalAddress.methodSelect.label"),
          placeholder: t("deed.nationalAddress.methodSelect.placeholder"),
        },
        methods: t.raw("deed.nationalAddress.methods") as Record<
          "photo" | "link" | "manual",
          {
            title: string;
            description: string;
          }
        >,
        mapTitle: t("deed.nationalAddress.mapTitle"),
        mapHint: t("deed.nationalAddress.mapHint"),
        coordinatesLabel: t("deed.nationalAddress.coordinatesLabel"),
        link: {
          label: t("deed.nationalAddress.link.label"),
          placeholder: t("deed.nationalAddress.link.placeholder"),
          hint: t("deed.nationalAddress.link.hint"),
          invalid: t("deed.nationalAddress.link.invalid"),
        },
        manual: {
          place: {
            label: t("deed.nationalAddress.manual.place.label"),
            placeholder: t("deed.nationalAddress.manual.place.placeholder"),
            loading: t("deed.nationalAddress.manual.place.loading"),
          },
          city: {
            label: t("deed.nationalAddress.manual.city.label"),
            placeholder: t("deed.nationalAddress.manual.city.placeholder"),
            loading: t("deed.nationalAddress.manual.city.loading"),
            selectPlaceFirst: t(
              "deed.nationalAddress.manual.city.selectPlaceFirst",
            ),
          },
          neighborhood: {
            label: t("deed.nationalAddress.manual.neighborhood.label"),
            placeholder: t("deed.nationalAddress.manual.neighborhood.placeholder"),
          },
          street: {
            label: t("deed.nationalAddress.manual.street.label"),
            placeholder: t("deed.nationalAddress.manual.street.placeholder"),
          },
          buildingNumber: {
            label: t("deed.nationalAddress.manual.buildingNumber.label"),
            placeholder: t(
              "deed.nationalAddress.manual.buildingNumber.placeholder",
            ),
          },
          postalCode: {
            label: t("deed.nationalAddress.manual.postalCode.label"),
            placeholder: t("deed.nationalAddress.manual.postalCode.placeholder"),
          },
          extraFigure: {
            label: t("deed.nationalAddress.manual.extraFigure.label"),
            placeholder: t("deed.nationalAddress.manual.extraFigure.placeholder"),
          },
        },
        photo: {
          label: t("deed.nationalAddress.photo.label"),
          clickHere: t("deed.nationalAddress.photo.clickHere"),
          chooseFile: t("deed.nationalAddress.photo.chooseFile"),
          acceptedFormats: t("deed.nationalAddress.photo.acceptedFormats"),
          hint: t("deed.nationalAddress.photo.hint"),
          attached: t("deed.nationalAddress.photo.attached"),
          preview: t("deed.nationalAddress.photo.preview"),
          change: t("deed.nationalAddress.photo.change"),
          delete: t("deed.nationalAddress.photo.delete"),
          previewTitle: t("deed.nationalAddress.photo.previewTitle"),
          closePreview: t("deed.nationalAddress.photo.closePreview"),
        },
      },
      leaseRenewal: {
        noticeResidential: t("deed.leaseRenewal.noticeResidential"),
        noticeCommercial: t("deed.leaseRenewal.noticeCommercial"),
        uploadLabel: t("deed.leaseRenewal.uploadLabel"),
        pdfHint: t("deed.leaseRenewal.pdfHint"),
        addressFieldLabel: t("deed.leaseRenewal.addressFieldLabel"),
        sameAddress: {
          title: t("deed.leaseRenewal.sameAddress.title"),
          description: t("deed.leaseRenewal.sameAddress.description"),
        },
        changeAddress: {
          title: t("deed.leaseRenewal.changeAddress.title"),
          description: t("deed.leaseRenewal.changeAddress.description"),
        },
        sameAddressConfirmation: t("deed.leaseRenewal.sameAddressConfirmation"),
      },
      waqf: {
        multipleTrusteesLabel: t("deed.waqf.multipleTrusteesLabel"),
        trusteesPoaHint: t("deed.waqf.trusteesPoaHint"),
      },
      deceased: {
        deedLabel: t("deed.deceased.deedLabel"),
        inheritanceLabel: t("deed.deceased.inheritanceLabel"),
        heirsPoaLabel: t("deed.deceased.heirsPoaLabel"),
        najizHint: t("deed.deceased.najizHint"),
        minorHeirsLabel: t("deed.deceased.minorHeirsLabel"),
        guardiansPoaLabel: t("deed.deceased.guardiansPoaLabel"),
        guardiansPoaHint: t("deed.deceased.guardiansPoaHint"),
        clickHere: t("deed.deceased.clickHere"),
        chooseFile: t("deed.deceased.chooseFile"),
      },
      manualEntry: {
        separator: t("deed.manualEntry.separator"),
        toggleLabel: t("deed.manualEntry.toggleLabel"),
        instrumentNumber: {
          label: t("deed.manualEntry.instrumentNumber.label"),
          placeholder: t("deed.manualEntry.instrumentNumber.placeholder"),
          hint: t("deed.manualEntry.instrumentNumber.hint"),
        },
        instrumentDate: {
          label: t("deed.manualEntry.instrumentDate.label"),
          hijri: t("deed.manualEntry.instrumentDate.hijri"),
          gregorian: t("deed.manualEntry.instrumentDate.gregorian"),
          day: t("deed.manualEntry.instrumentDate.day"),
          month: t("deed.manualEntry.instrumentDate.month"),
          year: t("deed.manualEntry.instrumentDate.year"),
          dayPlaceholder: t("deed.manualEntry.instrumentDate.dayPlaceholder"),
          monthPlaceholder: t("deed.manualEntry.instrumentDate.monthPlaceholder"),
          yearPlaceholder: t("deed.manualEntry.instrumentDate.yearPlaceholder"),
        },
      },
    },
    owner: {
      cancelRequest: t("owner.cancelRequest"),
      navigation: {
        previous: t("owner.navigation.previous"),
        continue: t("owner.navigation.continue"),
        saveLater: t("owner.navigation.saveLater"),
        savingLater: t("owner.navigation.savingLater"),
        submitting: t("owner.navigation.submitting"),
      },
      submitError: t("owner.submitError"),
      missingContractSession: t("owner.missingContractSession"),
      saveLaterError: t("owner.saveLaterError"),
      validation: {
        hintTitle: t("owner.validation.hintTitle"),
        issues: t.raw("owner.validation.issues") as CreateContractLabels["owner"]["validation"]["issues"],
        fieldErrors: {
          idNumberLength: t("owner.validation.fieldErrors.idNumberLength"),
          phoneLength: t("owner.validation.fieldErrors.phoneLength"),
          iban: t("owner.validation.fieldErrors.iban"),
        },
      },
      phases: t.raw("owner.phases") as CreateContractLabels["owner"]["phases"],
      birthDate: {
        label: t("owner.birthDate.label"),
        hijri: t("owner.birthDate.hijri"),
        gregorian: t("owner.birthDate.gregorian"),
        day: t("owner.birthDate.day"),
        month: t("owner.birthDate.month"),
        year: t("owner.birthDate.year"),
        dayPlaceholder: t("owner.birthDate.dayPlaceholder"),
        monthPlaceholder: t("owner.birthDate.monthPlaceholder"),
        yearPlaceholder: t("owner.birthDate.yearPlaceholder"),
      },
      ownerData: {
        fullName: {
          label: t("owner.ownerData.fullName.label"),
          placeholder: t("owner.ownerData.fullName.placeholder"),
        },
        idNumber: {
          label: t("owner.ownerData.idNumber.label"),
          placeholder: t("owner.ownerData.idNumber.placeholder"),
        },
        phone: {
          label: t("owner.ownerData.phone.label"),
          placeholder: t("owner.ownerData.phone.placeholder"),
        },
        iban: {
          label: t("owner.ownerData.iban.label"),
          placeholder: t("owner.ownerData.iban.placeholder"),
        },
        hasAgent: {
          title: t("owner.ownerData.hasAgent.title"),
          description: t("owner.ownerData.hasAgent.description"),
        },
      },
      agentData: {
        sectionTitle: t("owner.agentData.sectionTitle"),
        sectionDescription: t("owner.agentData.sectionDescription"),
        footerNote: t("owner.agentData.footerNote"),
        idNumber: {
          label: t("owner.agentData.idNumber.label"),
          placeholder: t("owner.agentData.idNumber.placeholder"),
        },
        birthDateLabel: t("owner.agentData.birthDateLabel"),
        phone: {
          label: t("owner.agentData.phone.label"),
          placeholder: t("owner.agentData.phone.placeholder"),
        },
        poaNumber: {
          label: t("owner.agentData.poaNumber.label"),
          placeholder: t("owner.agentData.poaNumber.placeholder"),
        },
        poaDate: {
          label: t("owner.agentData.poaDate.label"),
          placeholder: t("owner.agentData.poaDate.placeholder"),
        },
        powerOfAttorney: {
          label: t("owner.agentData.powerOfAttorney.label"),
          clickHere: t("owner.agentData.powerOfAttorney.clickHere"),
          chooseFile: t("owner.agentData.powerOfAttorney.chooseFile"),
          acceptedFormats: t("owner.agentData.powerOfAttorney.acceptedFormats"),
          attached: t("owner.agentData.powerOfAttorney.attached"),
          preview: t("owner.agentData.powerOfAttorney.preview"),
          change: t("owner.agentData.powerOfAttorney.change"),
          delete: t("owner.agentData.powerOfAttorney.delete"),
          previewTitle: t("owner.agentData.powerOfAttorney.previewTitle"),
          closePreview: t("owner.agentData.powerOfAttorney.closePreview"),
        },
      },
      representative: {
        deceasedSectionTitle: t("owner.representative.deceasedSectionTitle"),
        deceasedSectionDescription: t(
          "owner.representative.deceasedSectionDescription",
        ),
        waqfSectionTitle: t("owner.representative.waqfSectionTitle"),
        waqfSectionDescription: t("owner.representative.waqfSectionDescription"),
        capacityDocumentLabel: t("owner.representative.capacityDocumentLabel"),
        deceasedFields: t.raw(
          "owner.representative.deceasedFields",
        ) as CreateContractLabels["owner"]["representative"]["deceasedFields"],
        waqfFields: t.raw(
          "owner.representative.waqfFields",
        ) as CreateContractLabels["owner"]["representative"]["waqfFields"],
      },
    },
    tenant: {
      cancelRequest: t("tenant.cancelRequest"),
      submitError: t("tenant.submitError"),
      submitUnitError: t("tenant.submitUnitError"),
      missingContractSession: t("tenant.missingContractSession"),
      saveLaterError: t("tenant.saveLaterError"),
      navigation: {
        previous: t("tenant.navigation.previous"),
        continue: t("tenant.navigation.continue"),
        saveLater: t("tenant.navigation.saveLater"),
        savingLater: t("tenant.navigation.savingLater"),
        submitting: t("tenant.navigation.submitting"),
      },
      phases: t.raw("tenant.phases") as CreateContractLabels["tenant"]["phases"],
      tenantStatus: {
        label: t("tenant.tenantStatus.label"),
        placeholder: t("tenant.tenantStatus.placeholder"),
        options: Object.fromEntries(
          TENANT_STATUS_OPTIONS.map((status) => [
            status,
            t(`tenant.tenantStatus.options.${status}`),
          ]),
        ) as CreateContractLabels["tenant"]["tenantStatus"]["options"],
      },
      birthDate: {
        label: t("tenant.birthDate.label"),
        hijri: t("tenant.birthDate.hijri"),
        gregorian: t("tenant.birthDate.gregorian"),
        day: t("tenant.birthDate.day"),
        month: t("tenant.birthDate.month"),
        year: t("tenant.birthDate.year"),
        dayPlaceholder: t("tenant.birthDate.dayPlaceholder"),
        monthPlaceholder: t("tenant.birthDate.monthPlaceholder"),
        yearPlaceholder: t("tenant.birthDate.yearPlaceholder"),
      },
      individualData: {
        idNumber: {
          label: t("tenant.individualData.idNumber.label"),
          placeholder: t("tenant.individualData.idNumber.placeholder"),
        },
        phone: {
          label: t("tenant.individualData.phone.label"),
          placeholder: t("tenant.individualData.phone.placeholder"),
        },
      },
      organizationData: {
        delegationType: {
          label: t("tenant.organizationData.delegationType.label"),
          options: Object.fromEntries(
            DELEGATION_TYPE_OPTIONS.map((delegationType) => [
              delegationType,
              {
                title: t(
                  `tenant.organizationData.delegationType.options.${delegationType}.title`,
                ),
                description: t(
                  `tenant.organizationData.delegationType.options.${delegationType}.description`,
                ),
                ...(delegationType === "agent-authorized"
                  ? {
                      badge: t(
                        "tenant.organizationData.delegationType.options.agent-authorized.badge",
                      ),
                    }
                  : {}),
              },
            ]),
          ) as CreateContractLabels["tenant"]["organizationData"]["delegationType"]["options"],
        },
        unifiedRecordNumber: {
          label: t("tenant.organizationData.unifiedRecordNumber.label"),
          placeholder: t(
            "tenant.organizationData.unifiedRecordNumber.placeholder",
          ),
          hint: t("tenant.organizationData.unifiedRecordNumber.hint"),
        },
        ownerIdNumber: {
          label: t("tenant.organizationData.ownerIdNumber.label"),
          placeholder: t("tenant.organizationData.ownerIdNumber.placeholder"),
        },
        ownerBirthDateLabel: t(
          "tenant.organizationData.ownerBirthDateLabel",
        ),
        ownerPhone: {
          label: t("tenant.organizationData.ownerPhone.label"),
          placeholder: t("tenant.organizationData.ownerPhone.placeholder"),
        },
        powerOfAttorney: {
          label: t("tenant.organizationData.powerOfAttorney.label"),
          clickHere: t("tenant.organizationData.powerOfAttorney.clickHere"),
          chooseFile: t("tenant.organizationData.powerOfAttorney.chooseFile"),
          acceptedFormats: t(
            "tenant.organizationData.powerOfAttorney.acceptedFormats",
          ),
          hint: t("tenant.organizationData.powerOfAttorney.hint"),
          attached: t("tenant.organizationData.powerOfAttorney.attached"),
          preview: t("tenant.organizationData.powerOfAttorney.preview"),
          change: t("tenant.organizationData.powerOfAttorney.change"),
          delete: t("tenant.organizationData.powerOfAttorney.delete"),
          previewTitle: t(
            "tenant.organizationData.powerOfAttorney.previewTitle",
          ),
          closePreview: t(
            "tenant.organizationData.powerOfAttorney.closePreview",
          ),
        },
      },
      rentedUnit: {
        selectPlaceholder: t("tenant.rentedUnit.selectPlaceholder"),
        optionsError: t("tenant.rentedUnit.optionsError"),
        fieldRequired: t("fieldRequired"),
        unitType: {
          label: t("tenant.rentedUnit.unitType.label"),
          disabledGroupNotice: {
            housing: t(
              "tenant.rentedUnit.unitType.disabledGroupNotice.housing",
            ),
            commercial: t(
              "tenant.rentedUnit.unitType.disabledGroupNotice.commercial",
            ),
          },
        },
        unitUsage: {
          label: t("tenant.rentedUnit.unitUsage.label"),
        },
        totalArea: {
          label: t("tenant.rentedUnit.totalArea.label"),
          placeholder: t("tenant.rentedUnit.totalArea.placeholder"),
          suffix: t("tenant.rentedUnit.totalArea.suffix"),
        },
        floorNumber: {
          label: t("tenant.rentedUnit.floorNumber.label"),
        },
        floorOptions: {
          ground: t("tenant.rentedUnit.floorOptions.ground"),
        },
        unitNumber: {
          label: t("tenant.rentedUnit.unitNumber.label"),
          placeholder: t("tenant.rentedUnit.unitNumber.placeholder"),
        },
        unitCardTitle: t("tenant.rentedUnit.unitCardTitle"),
        addUnit: t("tenant.rentedUnit.addUnit"),
        removeUnit: t("tenant.rentedUnit.removeUnit"),
        unitsCount: t("tenant.rentedUnit.unitsCount"),
        unitListTitle: t("tenant.rentedUnit.unitListTitle"),
        floorSummaryPrefix: t("tenant.rentedUnit.floorSummaryPrefix"),
        additionalInfo: {
          toggle: t("tenant.rentedUnit.additionalInfo.toggle"),
          writeHerePlaceholder: t(
            "tenant.rentedUnit.additionalInfo.writeHerePlaceholder",
          ),
        },
        roomsCount: {
          label: t("tenant.rentedUnit.roomsCount.label"),
          hint: t("tenant.rentedUnit.roomsCount.hint"),
        },
        hallsCount: {
          label: t("tenant.rentedUnit.hallsCount.label"),
        },
        majlisCount: {
          label: t("tenant.rentedUnit.majlisCount.label"),
        },
        kitchensCount: {
          label: t("tenant.rentedUnit.kitchensCount.label"),
        },
        bathroomsCount: {
          label: t("tenant.rentedUnit.bathroomsCount.label"),
        },
        windowAcCount: {
          label: t("tenant.rentedUnit.windowAcCount.label"),
        },
        splitAcCount: {
          label: t("tenant.rentedUnit.splitAcCount.label"),
        },
        kitchenCabinetsInstalled: {
          label: t("tenant.rentedUnit.kitchenCabinetsInstalled.label"),
          kitchensRequiredHint: t(
            "tenant.rentedUnit.kitchenCabinetsInstalled.kitchensRequiredHint",
          ),
        },
        furnished: {
          label: t("tenant.rentedUnit.furnished.label"),
        },
        furnishingType: {
          label: t("tenant.rentedUnit.furnishingType.label"),
          new: t("tenant.rentedUnit.furnishingType.new"),
          used: t("tenant.rentedUnit.furnishingType.used"),
        },
        addElectricityMeter: {
          label: t("tenant.rentedUnit.addElectricityMeter.label"),
        },
        electricityMeterNumber: {
          label: t("tenant.rentedUnit.electricityMeterNumber.label"),
          placeholder: t("tenant.rentedUnit.electricityMeterNumber.placeholder"),
        },
        addWaterMeter: {
          label: t("tenant.rentedUnit.addWaterMeter.label"),
        },
        waterMeterNumber: {
          label: t("tenant.rentedUnit.waterMeterNumber.label"),
          placeholder: t("tenant.rentedUnit.waterMeterNumber.placeholder"),
        },
        meterRegistration: {
          title: t("tenant.rentedUnit.meterRegistration.title"),
          currency: t("tenant.rentedUnit.meterRegistration.currency"),
          tenant: {
            title: t("tenant.rentedUnit.meterRegistration.tenant.title"),
            subtitle: t("tenant.rentedUnit.meterRegistration.tenant.subtitle"),
            feeBadge: t("tenant.rentedUnit.meterRegistration.tenant.feeBadge"),
            feeFooter: t("tenant.rentedUnit.meterRegistration.tenant.feeFooter"),
          },
          owner: {
            title: t("tenant.rentedUnit.meterRegistration.owner.title"),
            subtitle: t("tenant.rentedUnit.meterRegistration.owner.subtitle"),
            noFee: t("tenant.rentedUnit.meterRegistration.owner.noFee"),
          },
          shared: t.raw(
            "tenant.rentedUnit.meterRegistration.shared",
          ) as CreateContractLabels["tenant"]["rentedUnit"]["meterRegistration"]["shared"],
          notice: {
            beforeFee: t("tenant.rentedUnit.meterRegistration.notice.beforeFee"),
            feeAmount: t("tenant.rentedUnit.meterRegistration.notice.feeAmount"),
            afterFee: t("tenant.rentedUnit.meterRegistration.notice.afterFee"),
            nonRefundable: t(
              "tenant.rentedUnit.meterRegistration.notice.nonRefundable",
            ),
            afterNonRefundable: t(
              "tenant.rentedUnit.meterRegistration.notice.afterNonRefundable",
            ),
            lessThanMonth: t(
              "tenant.rentedUnit.meterRegistration.notice.lessThanMonth",
            ),
            afterLessThanMonth: t(
              "tenant.rentedUnit.meterRegistration.notice.afterLessThanMonth",
            ),
          },
        },
      },
      leaseRenewal: {
        heading: t("tenant.leaseRenewal.heading"),
        subtitle: t("tenant.leaseRenewal.subtitle"),
        addNotesToggle: t("tenant.leaseRenewal.addNotesToggle"),
        edit: t("tenant.leaseRenewal.edit"),
        confirmContinue: t("tenant.leaseRenewal.confirmContinue"),
        unitFieldLabel: t("tenant.leaseRenewal.unitFieldLabel"),
        sameUnit: {
          title: t("tenant.leaseRenewal.sameUnit.title"),
          description: t("tenant.leaseRenewal.sameUnit.description"),
        },
        changeUnit: {
          title: t("tenant.leaseRenewal.changeUnit.title"),
          description: t("tenant.leaseRenewal.changeUnit.description"),
        },
        sameUnitConfirmation: t("tenant.leaseRenewal.sameUnitConfirmation"),
        notesDialog: {
          title: t("tenant.leaseRenewal.notesDialog.title"),
          close: t("tenant.leaseRenewal.notesDialog.close"),
          heading: t("tenant.leaseRenewal.notesDialog.heading"),
          subtitle: t("tenant.leaseRenewal.notesDialog.subtitle"),
          notesLabel: t("tenant.leaseRenewal.notesDialog.notesLabel"),
          notesPlaceholder: t("tenant.leaseRenewal.notesDialog.notesPlaceholder"),
          stepIndicator: t("tenant.leaseRenewal.notesDialog.stepIndicator"),
          save: t("tenant.leaseRenewal.notesDialog.save"),
        },
      },
      saveLaterDialog: {
        title: t("tenant.saveLaterDialog.title"),
        close: t("tenant.saveLaterDialog.close"),
        successTitle: t("tenant.saveLaterDialog.successTitle"),
        successDescription: t("tenant.saveLaterDialog.successDescription"),
        orderNumberLabel: t("tenant.saveLaterDialog.orderNumberLabel"),
        foundInLabel: t("tenant.saveLaterDialog.foundInLabel"),
        foundInValue: t("tenant.saveLaterDialog.foundInValue"),
        retentionLabel: t("tenant.saveLaterDialog.retentionLabel"),
        retentionDays: t("tenant.saveLaterDialog.retentionDays"),
        tip: t("tenant.saveLaterDialog.tip"),
        confirm: t("tenant.saveLaterDialog.confirm"),
        saving: t("tenant.saveLaterDialog.saving"),
      },
    },
    finance: {
      title: t("finance.title"),
      subtitle: t("finance.subtitle"),
      submitError: t("finance.submitError"),
      missingContractSession: t("finance.missingContractSession"),
      navigation: {
        previous: t("finance.navigation.previous"),
        continue: t("finance.navigation.continue"),
        submitting: t("finance.navigation.submitting"),
      },
      selectPlaceholder: t("finance.selectPlaceholder"),
      contractStartDate: {
        label: t("finance.contractStartDate.label"),
        hijri: t("finance.contractStartDate.hijri"),
        gregorian: t("finance.contractStartDate.gregorian"),
        day: t("finance.contractStartDate.day"),
        month: t("finance.contractStartDate.month"),
        year: t("finance.contractStartDate.year"),
        dayPlaceholder: t("finance.contractStartDate.dayPlaceholder"),
        monthPlaceholder: t("finance.contractStartDate.monthPlaceholder"),
        yearPlaceholder: t("finance.contractStartDate.yearPlaceholder"),
        correspondingHijri: t("finance.contractStartDate.correspondingHijri"),
        correspondingGregorian: t(
          "finance.contractStartDate.correspondingGregorian",
        ),
      },
      contractDuration: {
        label: t("finance.contractDuration.label"),
        loading: t("finance.contractDuration.loading"),
        optionsError: t("finance.contractDuration.optionsError"),
        otherOption: t("finance.contractDuration.otherOption"),
        feeLabel: t("finance.contractDuration.feeLabel"),
        currency: t("finance.contractDuration.currency"),
        custom: {
          yearsLabel: t("finance.contractDuration.custom.yearsLabel"),
          yearsPlaceholder: t(
            "finance.contractDuration.custom.yearsPlaceholder",
          ),
          monthsLabel: t("finance.contractDuration.custom.monthsLabel"),
          monthsPlaceholder: t(
            "finance.contractDuration.custom.monthsPlaceholder",
          ),
          yearOption: t("finance.contractDuration.custom.yearOption"),
          monthOption: t("finance.contractDuration.custom.monthOption"),
          monthOptionZero: t("finance.contractDuration.custom.monthOptionZero"),
          loadingPreview: t("finance.contractDuration.custom.loadingPreview"),
          previewError: t("finance.contractDuration.custom.previewError"),
        },
      },
      totalRentAmount: {
        label: t("finance.totalRentAmount.label"),
        placeholder: t("finance.totalRentAmount.placeholder"),
        amountInWords: t("finance.totalRentAmount.amountInWords"),
      },
      paymentMethod: {
        label: t("finance.paymentMethod.label"),
        loading: t("finance.paymentMethod.loading"),
        optionsError: t("finance.paymentMethod.optionsError"),
      },
      tenantPermissions: {
        title: t("finance.tenantPermissions.title"),
        subtitle: t("finance.tenantPermissions.subtitle"),
        instruction: t("finance.tenantPermissions.instruction"),
        optionsError: t("finance.tenantPermissions.optionsError"),
        close: t("finance.tenantPermissions.close"),
        confirmPrefix: t("finance.tenantPermissions.confirmPrefix"),
        serviceDefinitionLabel: t(
          "finance.tenantPermissions.serviceDefinitionLabel",
        ),
        depositNote: t("finance.tenantPermissions.depositNote"),
        currency: t("finance.tenantPermissions.currency"),
        currencyPerDay: t("finance.tenantPermissions.currencyPerDay"),
        inputRequired: t("finance.tenantPermissions.inputRequired"),
        inputFallbackLabel: t("finance.tenantPermissions.inputFallbackLabel"),
      },
      otherConditions: {
        title: t("finance.otherConditions.title"),
        subtitle: t("finance.otherConditions.subtitle"),
        instruction: t("finance.otherConditions.instruction"),
        placeholder: t("finance.otherConditions.placeholder"),
        add: t("finance.otherConditions.add"),
        remove: t("finance.otherConditions.remove"),
        clearSummary: t("finance.otherConditions.clearSummary"),
        addedSummaryOne: t("finance.otherConditions.addedSummaryOne"),
        addedSummaryTwo: t("finance.otherConditions.addedSummaryTwo"),
        addedSummaryFew: t.raw(
          "finance.otherConditions.addedSummaryFew",
        ) as string,
        addedSummaryMany: t.raw(
          "finance.otherConditions.addedSummaryMany",
        ) as string,
      },
    },
    payment: {
      title: t("payment.title"),
      subtitle: t("payment.subtitle"),
      encryptionNote: t("payment.encryptionNote"),
      journeyMessage: t("payment.journeyMessage"),
      securePaymentLabel: t("payment.securePaymentLabel"),
      reviewOrderLabel: t("payment.reviewOrderLabel"),
      reviewDialog: {
        title: t("payment.reviewDialog.title"),
        close: t("payment.reviewDialog.close"),
        edit: t("payment.reviewDialog.edit"),
        view: t("payment.reviewDialog.view"),
        linkPreview: t("payment.reviewDialog.linkPreview"),
        confirm: t("payment.reviewDialog.confirm"),
        hint: t("payment.reviewDialog.hint"),
        emptyValue: t("payment.reviewDialog.emptyValue"),
        unitIncomplete: t("payment.reviewDialog.unitIncomplete"),
        orderNumber: t("payment.reviewDialog.orderNumber"),
        contractUuid: t("payment.reviewDialog.contractUuid"),
        share: t("payment.reviewDialog.share"),
        copy: t("payment.reviewDialog.copy"),
        print: t("payment.reviewDialog.print"),
        download: t("payment.reviewDialog.download"),
        attachmentPreviewTitle: t("payment.reviewDialog.attachmentPreviewTitle"),
        copySuccess: t("payment.reviewDialog.copySuccess"),
        copyError: t("payment.reviewDialog.copyError"),
        shareError: t("payment.reviewDialog.shareError"),
        sections: {
          deed: t("payment.reviewDialog.sections.deed"),
          nationalAddress: t("payment.reviewDialog.sections.nationalAddress"),
          ownerSelf: t("payment.reviewDialog.sections.ownerSelf"),
          ownerWithAgent: t("payment.reviewDialog.sections.ownerWithAgent"),
          tenantIndividual: t("payment.reviewDialog.sections.tenantIndividual"),
          tenantOrganization: t(
            "payment.reviewDialog.sections.tenantOrganization",
          ),
          unit: t("payment.reviewDialog.sections.unit"),
          rent: t("payment.reviewDialog.sections.rent"),
        },
        fields: {
          contractType: t("payment.reviewDialog.fields.contractType"),
          startDate: t("payment.reviewDialog.fields.startDate"),
          duration: t("payment.reviewDialog.fields.duration"),
          documentType: t("payment.reviewDialog.fields.documentType"),
          deedAttachment: t("payment.reviewDialog.fields.deedAttachment"),
          leaseRenewalAttachment: t(
            "payment.reviewDialog.fields.leaseRenewalAttachment",
          ),
          mapsLink: t("payment.reviewDialog.fields.mapsLink"),
          addressPhoto: t("payment.reviewDialog.fields.addressPhoto"),
          addressManual: t("payment.reviewDialog.fields.addressManual"),
          ownerId: t("payment.reviewDialog.fields.ownerId"),
          ownerPhone: t("payment.reviewDialog.fields.ownerPhone"),
          ownerBirthDate: t("payment.reviewDialog.fields.ownerBirthDate"),
          tenantDelegation: t("payment.reviewDialog.fields.tenantDelegation"),
          tenantUnifiedRecord: t(
            "payment.reviewDialog.fields.tenantUnifiedRecord",
          ),
          tenantId: t("payment.reviewDialog.fields.tenantId"),
          tenantPhone: t("payment.reviewDialog.fields.tenantPhone"),
          tenantBirthDate: t("payment.reviewDialog.fields.tenantBirthDate"),
          tenantOwnerId: t("payment.reviewDialog.fields.tenantOwnerId"),
          tenantOwnerPhone: t("payment.reviewDialog.fields.tenantOwnerPhone"),
          tenantOwnerBirthDate: t(
            "payment.reviewDialog.fields.tenantOwnerBirthDate",
          ),
          unitType: t("payment.reviewDialog.fields.unitType"),
          unitUsage: t("payment.reviewDialog.fields.unitUsage"),
          floor: t("payment.reviewDialog.fields.floor"),
          unitNumber: t("payment.reviewDialog.fields.unitNumber"),
          area: t("payment.reviewDialog.fields.area"),
          rooms: t("payment.reviewDialog.fields.rooms"),
          bathrooms: t("payment.reviewDialog.fields.bathrooms"),
          kitchens: t("payment.reviewDialog.fields.kitchens"),
          kitchenCabinets: t("payment.reviewDialog.fields.kitchenCabinets"),
          paymentMethod: t("payment.reviewDialog.fields.paymentMethod"),
        },
        delegation: {
          "owner-representative": t(
            "payment.reviewDialog.delegation.owner-representative",
          ),
          "agent-authorized": t(
            "payment.reviewDialog.delegation.agent-authorized",
          ),
        },
        kitchenCabinets: {
          installed: t("payment.reviewDialog.kitchenCabinets.installed"),
          notInstalled: t("payment.reviewDialog.kitchenCabinets.notInstalled"),
        },
        calendar: {
          hijri: t("payment.reviewDialog.calendar.hijri"),
          gregorian: t("payment.reviewDialog.calendar.gregorian"),
        },
        currency: t("payment.reviewDialog.currency"),
        areaUnit: t("payment.reviewDialog.areaUnit"),
        contractTypeResidential: t(
          "payment.reviewDialog.contractTypeResidential",
        ),
        contractTypeCommercial: t(
          "payment.reviewDialog.contractTypeCommercial",
        ),
        sameAddress: t("payment.reviewDialog.sameAddress"),
        sameUnit: t("payment.reviewDialog.sameUnit"),
        yearsCount: t("payment.reviewDialog.yearsCount"),
        monthsCount: t("payment.reviewDialog.monthsCount"),
        paymentMethodPrefix: t("payment.reviewDialog.paymentMethodPrefix"),
      },
      navigation: {
        previous: t("payment.navigation.previous"),
        pay: t("payment.navigation.pay"),
        payWithAmount: t("payment.navigation.payWithAmount"),
        sendDraft: t("payment.navigation.sendDraft"),
        paying: t("payment.navigation.paying"),
        payError: t("payment.navigation.payError"),
        save: t("payment.navigation.save"),
        saveError: t("payment.navigation.saveError"),
      },
      summary: {
        sectionTitle: t("payment.summary.sectionTitle"),
        ejarFees: t("payment.summary.ejarFees"),
        contractPeriodPrice: t("payment.summary.contractPeriodPrice"),
        vat: t("payment.summary.vat"),
        applicationFees: t("payment.summary.applicationFees"),
        electricityMeterFee: t("payment.summary.electricityMeterFee"),
        waterMeterFee: t("payment.summary.waterMeterFee"),
        meterFeesTotal: t("payment.summary.meterFeesTotal"),
        services: t("payment.summary.services"),
        servicesTotal: t("payment.summary.servicesTotal"),
        docFee: t("payment.summary.docFee"),
        documentSurcharge: t("payment.summary.documentSurcharge"),
        documentSurchargeHint: t("payment.summary.documentSurchargeHint"),
        sharedMetersTitle: t("payment.summary.sharedMetersTitle"),
        sharedElectricityMeter: t("payment.summary.sharedElectricityMeter"),
        sharedWaterMeter: t("payment.summary.sharedWaterMeter"),
        sharedMetersNote: t("payment.summary.sharedMetersNote"),
        total: t("payment.summary.total"),
        priceBeforeCoupon: t("payment.summary.priceBeforeCoupon"),
        discount: t("payment.summary.discount"),
        priceAfterCoupon: t("payment.summary.priceAfterCoupon"),
        currency: t("payment.summary.currency"),
        ejarLogoAlt: t("payment.summary.ejarLogoAlt"),
        free: t("payment.summary.free"),
        contractTypeResidential: t("payment.summary.contractTypeResidential"),
        contractTypeCommercial: t("payment.summary.contractTypeCommercial"),
        yearsCount: t("payment.summary.yearsCount"),
        monthsCount: t("payment.summary.monthsCount"),
      },
      savePropertyData: {
        label: t("payment.savePropertyData.label"),
        description: t("payment.savePropertyData.description"),
        dialog: {
          title: t("payment.savePropertyData.dialog.title"),
          close: t("payment.savePropertyData.dialog.close"),
          heading: t("payment.savePropertyData.dialog.heading"),
          subtitle: t("payment.savePropertyData.dialog.subtitle"),
          nameLabel: t("payment.savePropertyData.dialog.nameLabel"),
          namePlaceholder: t("payment.savePropertyData.dialog.namePlaceholder"),
          nameHint: t("payment.savePropertyData.dialog.nameHint"),
          nameExample: t("payment.savePropertyData.dialog.nameExample"),
          save: t("payment.savePropertyData.dialog.save"),
          saving: t("payment.savePropertyData.dialog.saving"),
          submitError: t("payment.savePropertyData.dialog.submitError"),
          submitSuccess: t("payment.savePropertyData.dialog.submitSuccess"),
          missingContractSession: t(
            "payment.savePropertyData.dialog.missingContractSession",
          ),
        },
      },
      discountCode: {
        question: t("payment.discountCode.question"),
        add: t("payment.discountCode.add"),
        placeholder: t("payment.discountCode.placeholder"),
        apply: t("payment.discountCode.apply"),
        applying: t("payment.discountCode.applying"),
        clear: t("payment.discountCode.clear"),
        applyError: t("payment.discountCode.applyError"),
        alreadyApplied: t("payment.discountCode.alreadyApplied"),
        missingContractSession: t("payment.discountCode.missingContractSession"),
      },
      disclaimer: {
        prefix: t("payment.disclaimer.prefix"),
        termsLink: t("payment.disclaimer.termsLink"),
        and: t("payment.disclaimer.and"),
        privacyLink: t("payment.disclaimer.privacyLink"),
        termsHref: t("payment.disclaimer.termsHref"),
        privacyHref: t("payment.disclaimer.privacyHref"),
      },
      methodDialog: {
        title: t("payment.methodDialog.title"),
        subtitle: t("payment.methodDialog.subtitle"),
        submitting: t("payment.methodDialog.submitting"),
        draft: {
          title: t("payment.methodDialog.draft.title"),
          description: t("payment.methodDialog.draft.description"),
          steps: t.raw("payment.methodDialog.draft.steps") as string[],
          note: t("payment.methodDialog.draft.note"),
        },
        payNow: {
          title: t("payment.methodDialog.payNow.title"),
          description: t("payment.methodDialog.payNow.description"),
          badge: t("payment.methodDialog.payNow.badge"),
          discountBadge: t("payment.methodDialog.payNow.discountBadge"),
          steps: t.raw("payment.methodDialog.payNow.steps") as string[],
          note: t("payment.methodDialog.payNow.note"),
        },
        selected: {
          draft: {
            title: t("payment.methodDialog.selected.draft.title"),
            description: t("payment.methodDialog.selected.draft.description"),
          },
          payNow: {
            title: t("payment.methodDialog.selected.payNow.title"),
            description: t("payment.methodDialog.selected.payNow.description"),
            savings: t("payment.methodDialog.selected.payNow.savings"),
          },
        },
        footerNote: t("payment.methodDialog.footerNote"),
        footerNoteTitle: t("payment.methodDialog.footerNoteTitle"),
        afterDiscount: t("payment.methodDialog.afterDiscount"),
        total: t("payment.methodDialog.total"),
        currency: t("payment.methodDialog.currency"),
        close: t("payment.methodDialog.close"),
        missingContractSession: t("payment.methodDialog.missingContractSession"),
        draftError: t("payment.methodDialog.draftError"),
        changeMethod: t("payment.methodDialog.changeMethod"),
        confirmPayNow: t("payment.methodDialog.confirmPayNow"),
      },
      draftSuccessDialog: {
        title: t("payment.draftSuccessDialog.title"),
        paymentStatusLabel: t("payment.draftSuccessDialog.paymentStatusLabel"),
        paymentStatusDescription: t(
          "payment.draftSuccessDialog.paymentStatusDescription",
        ),
        orderNumberLabel: t("payment.draftSuccessDialog.orderNumberLabel"),
        copy: t("payment.draftSuccessDialog.copy"),
        copySuccess: t("payment.draftSuccessDialog.copySuccess"),
        copyError: t("payment.draftSuccessDialog.copyError"),
        preparationDescription: t(
          "payment.draftSuccessDialog.preparationDescription",
        ),
          whatsappCta: t("payment.draftSuccessDialog.whatsappCta"),
          whatsappHref,
      },
    },
    prices: {
      residential: t("prices.residential"),
      commercial: t("prices.commercial"),
      additionalYear: t("prices.additionalYear"),
    },
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CreateContractPageContent labels={labels} contractType={contractType} fix={fixParams} />
    </HydrationBoundary>
  );
}
