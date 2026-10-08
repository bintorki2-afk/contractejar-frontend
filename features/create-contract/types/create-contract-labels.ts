import type { DeedTypeId } from "@/features/create-contract/types/deed-type";
import type {
  DelegationTypeOption,
  TenantStatusOption,
} from "@/features/create-contract/types/tenant-step";
import type { ManualDeedEntryLabels } from "@/features/shared/types/manual-deed-entry-labels";

export type RepresentativeFieldLabels = {
  idNumber: string;
  phone: string;
  birthDate: string;
  capacityDocument: string;
};

export type CreateContractLabels = {
  backLabel: string;
  pageTitleResidential: string;
  pageTitleCommercial: string;
  header: {
    home: string;
    help: string;
    dark: string;
    light: string;
    requestPrefix: string;
    copySuccess: string;
    copyError: string;
    whatsappHref: string;
    exitHomeDialog: {
      title: string;
      close: string;
      incompleteTitle: string;
      description: string;
      saveThenExit: string;
      saving: string;
      exitWithoutSaving: string;
      exitingWithoutSaving: string;
      continue: string;
      saveError: string;
      missingContractSession: string;
    };
  };
  stepper: {
    journey: string;
    ejarLogoAlt: string;
    steps: {
      intro: string;
      deed: string;
      owner: string;
      tenant: string;
      finance: string;
    };
  };
  intro: {
    title: string;
    subtitle: string;
    requirements: string[];
    priceLabel: string;
    currency: string;
    viewAllPrices: string;
    start: string;
    startContractLoading: string;
    startContractError: string;
    priceDialog: {
      title: string;
      close: string;
      yearOrLess: string;
      additionalYear: string;
      disclaimer: string;
    };
  };
  deed: {
    navigation: {
      previous: string;
      continue: string;
      submitting: string;
    };
    submitError: string;
    submitAddressError: string;
    missingContractSession: string;
    phases: {
      title: string;
      subtitle: string;
      /** Shown under the title while the stage is locked (address stage). */
      lockedHint?: string;
    }[];
    deedType: {
      label: string;
      placeholder: string;
      clearSelection: string;
      types: Record<DeedTypeId, string>;
    };
    deedImage: {
      label: string;
      frontLabel?: string;
      backLabel?: string;
      inheritanceLabel?: string;
      heirsPoaLabel?: string;
      endowmentCertLabel?: string;
      trusteeshipLabel?: string;
      guardiansPoaLabel?: string;
      salePaperLabel?: string;
      adversePossessionLabel?: string;
      economicCitiesLabel?: string;
      paperLabel?: string;
      clickHere: string;
      chooseFile: string;
      acceptedFormats: string;
      hint?: string;
      attached: string;
      preview: string;
      change: string;
      delete: string;
      previewTitle: string;
      closePreview: string;
    };
    sublease: {
      alertTitle: string;
      notes: string[];
      uploadLabel: string;
      pdfHint: string;
    };
    deceased: {
      deedLabel: string;
      inheritanceLabel: string;
      heirsPoaLabel: string;
      najizHint: string;
      minorHeirsLabel: string;
      guardiansPoaLabel: string;
      guardiansPoaHint: string;
      clickHere: string;
      chooseFile: string;
    };
    nationalAddress: {
      methodSelect: {
        label: string;
        placeholder: string;
      };
      methods: Record<
        "photo" | "link" | "manual",
        {
          title: string;
          description: string;
        }
      >;
      mapTitle: string;
      mapHint: string;
      coordinatesLabel: string;
      link: {
        label: string;
        placeholder: string;
        hint?: string;
        invalid?: string;
      };
      manual: {
        place: {
          label: string;
          placeholder: string;
          loading: string;
        };
        city: {
          label: string;
          placeholder: string;
          loading: string;
          selectPlaceFirst: string;
        };
        neighborhood: {
          label: string;
          placeholder: string;
        };
        street: {
          label: string;
          placeholder: string;
        };
        buildingNumber: {
          label: string;
          placeholder: string;
        };
        postalCode: {
          label: string;
          placeholder: string;
        };
        extraFigure: {
          label: string;
          placeholder: string;
        };
      };
      photo: CreateContractLabels["deed"]["deedImage"];
    };
    leaseRenewal: {
      noticeResidential: string;
      noticeCommercial: string;
      uploadLabel: string;
      pdfHint: string;
      addressFieldLabel: string;
      sameAddress: {
        title: string;
        description: string;
      };
      changeAddress: {
        title: string;
        description: string;
      };
      sameAddressConfirmation: string;
    };
    waqf: {
      multipleTrusteesLabel: string;
      trusteesPoaHint: string;
    };
    manualEntry: ManualDeedEntryLabels;
  };
  owner: {
    cancelRequest: string;
    navigation: {
      previous: string;
      continue: string;
      saveLater: string;
      savingLater: string;
      submitting: string;
    };
    submitError: string;
    missingContractSession: string;
    saveLaterError: string;
    validation: {
      hintTitle: string;
      issues: Record<
        | "fullName"
        | "idNumber"
        | "idNumberLength"
        | "birthDate"
        | "phone"
        | "phoneLength"
        | "iban"
        | "ibanInvalid"
        | "hasAgent"
        | "powerOfAttorney",
        string
      >;
      fieldErrors: {
        idNumberLength: string;
        phoneLength: string;
        iban: string;
      };
    };
    phases: {
      title: string;
      subtitle: string;
    }[];
    birthDate: {
      label: string;
      hijri: string;
      gregorian: string;
      day: string;
      month: string;
      year: string;
      dayPlaceholder: string;
      monthPlaceholder: string;
      yearPlaceholder: string;
    };
    ownerData: {
      fullName: {
        label: string;
        placeholder: string;
      };
      idNumber: {
        label: string;
        placeholder: string;
      };
      phone: {
        label: string;
        placeholder: string;
      };
      iban: {
        label: string;
        placeholder: string;
      };
      hasAgent: {
        title: string;
        description: string;
      };
    };
    agentData: {
      sectionTitle: string;
      sectionDescription: string;
      footerNote: string;
      idNumber: {
        label: string;
        placeholder: string;
      };
      birthDateLabel: string;
      phone: {
        label: string;
        placeholder: string;
      };
      poaNumber: {
        label: string;
        placeholder: string;
      };
      poaDate: {
        label: string;
        placeholder: string;
      };
      powerOfAttorney: CreateContractLabels["deed"]["deedImage"];
    };
    representative: {
      deceasedSectionTitle: string;
      deceasedSectionDescription: string;
      waqfSectionTitle: string;
      waqfSectionDescription: string;
      capacityDocumentLabel: string;
      deceasedFields: RepresentativeFieldLabels;
      waqfFields: RepresentativeFieldLabels;
    };
  };
  tenant: {
    cancelRequest: string;
    submitError: string;
    submitUnitError: string;
    missingContractSession: string;
    saveLaterError: string;
    navigation: {
      previous: string;
      continue: string;
      saveLater: string;
      savingLater: string;
      submitting: string;
    };
    phases: {
      title: string;
      subtitle: string;
    }[];
    tenantStatus: {
      label: string;
      placeholder: string;
      options: Record<TenantStatusOption, string>;
    };
    birthDate: {
      label: string;
      hijri: string;
      gregorian: string;
      day: string;
      month: string;
      year: string;
      dayPlaceholder: string;
      monthPlaceholder: string;
      yearPlaceholder: string;
    };
    individualData: {
      idNumber: {
        label: string;
        placeholder: string;
      };
      phone: {
        label: string;
        placeholder: string;
      };
    };
    organizationData: {
      delegationType: {
        label: string;
        options: Record<
          DelegationTypeOption,
          {
            title: string;
            description: string;
            badge?: string;
          }
        >;
      };
      unifiedRecordNumber: {
        label: string;
        placeholder: string;
        hint: string;
      };
      ownerIdNumber: {
        label: string;
        placeholder: string;
      };
      ownerBirthDateLabel: string;
      ownerPhone: {
        label: string;
        placeholder: string;
      };
      powerOfAttorney: CreateContractLabels["deed"]["deedImage"];
    };
    rentedUnit: {
      selectPlaceholder: string;
      optionsError: string;
      fieldRequired: string;
      unitType: {
        label: string;
        disabledGroupNotice: {
          housing: string;
          commercial: string;
        };
      };
      unitUsage: {
        label: string;
      };
      totalArea: {
        label: string;
        placeholder: string;
        suffix: string;
      };
      floorNumber: {
        label: string;
      };
      floorOptions: {
        ground: string;
      };
      unitNumber: {
        label: string;
        placeholder: string;
      };
      unitCardTitle?: string;
      addUnit: string;
      removeUnit: string;
      unitsCount: string;
      unitListTitle: string;
      floorSummaryPrefix: string;
      additionalInfo: {
        toggle: string;
        writeHerePlaceholder: string;
      };
      roomsCount: {
        label: string;
        hint?: string;
      };
      hallsCount: {
        label: string;
      };
      majlisCount: {
        label: string;
      };
      kitchensCount: {
        label: string;
      };
      bathroomsCount: {
        label: string;
      };
      windowAcCount: {
        label: string;
      };
      splitAcCount: {
        label: string;
      };
      kitchenCabinetsInstalled: {
        label: string;
        kitchensRequiredHint?: string;
      };
      furnished: {
        label: string;
      };
      furnishingType: {
        label: string;
        new: string;
        used: string;
      };
      addElectricityMeter: {
        label: string;
      };
      electricityMeterNumber: {
        label: string;
        placeholder: string;
      };
      addWaterMeter: {
        label: string;
      };
      waterMeterNumber: {
        label: string;
        placeholder: string;
      };
      meterRegistration: {
        title: string;
        currency: string;
        tenant: {
          title: string;
          subtitle: string;
          feeBadge: string;
          feeFooter: string;
        };
        owner: {
          title: string;
          subtitle: string;
          noFee: string;
        };
        shared: {
          title: string;
          subtitle: string;
          footer: string;
          amountLabel: string;
          amountPlaceholder: string;
          totalHint: string;
          durationUnknownHint: string;
          termNote: string;
        };
        notice: {
          beforeFee: string;
          feeAmount: string;
          afterFee: string;
          nonRefundable: string;
          afterNonRefundable: string;
          lessThanMonth: string;
          afterLessThanMonth: string;
        };
      };
    };
    leaseRenewal: {
      heading: string;
      subtitle: string;
      addNotesToggle: string;
      edit: string;
      confirmContinue: string;
      unitFieldLabel: string;
      sameUnit: {
        title: string;
        description: string;
      };
      changeUnit: {
        title: string;
        description: string;
      };
      sameUnitConfirmation: string;
      notesDialog: {
        title: string;
        close: string;
        heading: string;
        subtitle: string;
        notesLabel: string;
        notesPlaceholder: string;
        stepIndicator: string;
        save: string;
      };
    };
    saveLaterDialog: {
      title: string;
      close: string;
      successTitle: string;
      successDescription: string;
      orderNumberLabel: string;
      foundInLabel: string;
      foundInValue: string;
      retentionLabel: string;
      retentionDays: string;
      tip: string;
      confirm: string;
      saving: string;
    };
  };
  finance: {
    title: string;
    subtitle: string;
    submitError: string;
    missingContractSession: string;
    navigation: {
      previous: string;
      continue: string;
      submitting: string;
    };
    selectPlaceholder: string;
    contractStartDate: {
      label: string;
      hijri: string;
      gregorian: string;
      day: string;
      month: string;
      year: string;
      dayPlaceholder: string;
      monthPlaceholder: string;
      yearPlaceholder: string;
      correspondingHijri: string;
      correspondingGregorian: string;
    };
    contractDuration: {
      label: string;
      loading: string;
      optionsError: string;
      otherOption: string;
      feeLabel: string;
      currency: string;
      custom: {
        yearsLabel: string;
        yearsPlaceholder: string;
        monthsLabel: string;
        monthsPlaceholder: string;
        yearOption: string;
        monthOption: string;
        monthOptionZero: string;
        loadingPreview: string;
        previewError: string;
      };
    };
    totalRentAmount: {
      label: string;
      placeholder: string;
      amountInWords: string;
    };
    paymentMethod: {
      label: string;
      loading: string;
      optionsError: string;
    };
    tenantPermissions: {
      title: string;
      subtitle: string;
      instruction: string;
      optionsError: string;
      close: string;
      confirmPrefix: string;
      serviceDefinitionLabel: string;
      depositNote: string;
      currency: string;
      currencyPerDay: string;
      inputRequired: string;
      inputFallbackLabel: string;
    };
    otherConditions: {
      title: string;
      subtitle: string;
      instruction: string;
      placeholder: string;
      add: string;
      remove: string;
      clearSummary: string;
      addedSummaryOne: string;
      addedSummaryTwo: string;
      addedSummaryFew: string;
      addedSummaryMany: string;
    };
  };
  payment: {
    title: string;
    subtitle: string;
    encryptionNote: string;
    journeyMessage: string;
    securePaymentLabel: string;
    reviewOrderLabel: string;
    reviewDialog: {
      title: string;
      close: string;
      edit: string;
      view: string;
      linkPreview: string;
      confirm: string;
      hint: string;
      emptyValue: string;
      unitIncomplete: string;
      orderNumber: string;
      contractUuid: string;
      share: string;
      copy: string;
      print: string;
      download: string;
      attachmentPreviewTitle: string;
      copySuccess: string;
      copyError: string;
      shareError: string;
      sections: {
        deed: string;
        nationalAddress: string;
        ownerSelf: string;
        ownerWithAgent: string;
        tenantIndividual: string;
        tenantOrganization: string;
        unit: string;
        rent: string;
      };
      fields: {
        contractType: string;
        startDate: string;
        duration: string;
        documentType: string;
        deedAttachment: string;
        leaseRenewalAttachment: string;
        mapsLink: string;
        addressPhoto: string;
        addressManual: string;
        ownerId: string;
        ownerPhone: string;
        ownerBirthDate: string;
        tenantDelegation: string;
        tenantUnifiedRecord: string;
        tenantId: string;
        tenantPhone: string;
        tenantBirthDate: string;
        tenantOwnerId: string;
        tenantOwnerPhone: string;
        tenantOwnerBirthDate: string;
        unitType: string;
        unitUsage: string;
        floor: string;
        unitNumber: string;
        area: string;
        rooms: string;
        bathrooms: string;
        kitchens: string;
        kitchenCabinets: string;
        paymentMethod: string;
      };
      delegation: {
        "owner-representative": string;
        "agent-authorized": string;
      };
      kitchenCabinets: {
        installed: string;
        notInstalled: string;
      };
      calendar: {
        hijri: string;
        gregorian: string;
      };
      currency: string;
      areaUnit: string;
      contractTypeResidential: string;
      contractTypeCommercial: string;
      sameAddress: string;
      sameUnit: string;
      yearsCount: string;
      monthsCount: string;
      paymentMethodPrefix: string;
    };
    navigation: {
      previous: string;
      pay: string;
      payWithAmount: string;
      sendDraft: string;
      paying: string;
      payError: string;
      save: string;
      saveError: string;
    };
    summary: {
      sectionTitle: string;
      ejarFees: string;
      contractPeriodPrice: string;
      vat: string;
      applicationFees: string;
      electricityMeterFee: string;
      waterMeterFee: string;
      meterFeesTotal: string;
      services: string;
      servicesTotal: string;
      docFee: string;
      documentSurcharge: string;
      documentSurchargeHint: string;
      sharedMetersTitle: string;
      sharedElectricityMeter: string;
      sharedWaterMeter: string;
      sharedMetersNote: string;
      total: string;
      priceBeforeCoupon: string;
      discount: string;
      priceAfterCoupon: string;
      currency: string;
      ejarLogoAlt: string;
      free: string;
      contractTypeResidential: string;
      contractTypeCommercial: string;
      yearsCount: string;
      monthsCount: string;
    };
    savePropertyData: {
      label: string;
      description: string;
      dialog: {
        title: string;
        close: string;
        heading: string;
        subtitle: string;
        nameLabel: string;
        namePlaceholder: string;
        nameHint: string;
        nameExample: string;
        save: string;
        saving: string;
        submitError: string;
        submitSuccess: string;
        missingContractSession: string;
      };
    };
    discountCode: {
      question: string;
      add: string;
      placeholder: string;
      apply: string;
      applying: string;
      clear: string;
      applyError: string;
      alreadyApplied: string;
      missingContractSession: string;
    };
    disclaimer: {
      prefix: string;
      termsLink: string;
      and: string;
      privacyLink: string;
      termsHref: string;
      privacyHref: string;
    };
    methodDialog: {
      title: string;
      subtitle: string;
      submitting: string;
      draft: {
        title: string;
        description: string;
        steps: string[];
        note: string;
      };
      payNow: {
        title: string;
        description: string;
        badge: string;
        discountBadge: string;
        steps: string[];
        note: string;
      };
      selected: {
        draft: {
          title: string;
          description: string;
        };
        payNow: {
          title: string;
          description: string;
          savings: string;
        };
      };
      footerNote: string;
      footerNoteTitle: string;
      afterDiscount: string;
      total: string;
      currency: string;
      close: string;
      missingContractSession: string;
      draftError: string;
      changeMethod: string;
      confirmPayNow: string;
    };
    draftSuccessDialog: {
      title: string;
      paymentStatusLabel: string;
      paymentStatusDescription: string;
      orderNumberLabel: string;
      copy: string;
      copySuccess: string;
      copyError: string;
      preparationDescription: string;
      whatsappCta: string;
      whatsappHref: string;
    };
  };
  prices: {
    residential: string;
    commercial: string;
    additionalYear: string;
  };
};
