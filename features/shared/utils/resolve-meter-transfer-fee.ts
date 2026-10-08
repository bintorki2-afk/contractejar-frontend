export type MeterKind = "electricity" | "water";

export function formatMeterFee(fee: number) {
  return new Intl.NumberFormat("en-US").format(fee);
}
