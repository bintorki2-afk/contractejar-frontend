export type UnitFormLabels = {
  selectPlaceholder: string;
  fieldRequired: string;
  contractType?: {
    label: string;
    linkedLabel?: string;
    options: {
      housing: string;
      commercial: string;
    };
    descriptions?: {
      housing: string;
      commercial: string;
    };
  };
  unitType: { label: string };
  unitUsage: { label: string };
  totalArea: {
    label: string;
    placeholder: string;
    suffix: string;
  };
  floorNumber: { label: string };
  floorOptions: { ground: string };
  unitNumber: {
    label: string;
    placeholder: string;
  };
  unitCardTitle?: string;
  addUnit?: string;
  unitsCount?: string;
  unitListTitle?: string;
  floorSummaryPrefix?: string;
  additionalInfo: {
    toggle: string;
    writeHerePlaceholder: string;
  };
  roomsCount: { label: string; hint?: string };
  hallsCount: { label: string };
  majlisCount: { label: string };
  kitchensCount: { label: string };
  bathroomsCount: { label: string };
  windowAcCount: { label: string };
  splitAcCount: { label: string };
  kitchenCabinetsInstalled: {
    label: string;
    kitchensRequiredHint?: string;
  };
  furnished: { label: string };
  furnishingType: {
    label: string;
    new: string;
    used: string;
  };
  addElectricityMeter: { label: string };
  electricityMeterNumber: {
    label: string;
    placeholder: string;
  };
  /** Shown under a toggled-on meter whose number is still empty. */
  meterNumberRequired?: string;
  addWaterMeter: { label: string };
  waterMeterNumber: {
    label: string;
    placeholder: string;
  };
  meterRegistration?: {
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
      /** {monthly} {months} {total} {currency} */
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
