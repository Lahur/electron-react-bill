export const BillVatRate = {
  Pdv25: "Pdv25",
  Pdv0: "Pdv0",
  ReverseCharge: "ReverseCharge",
} as const;

export type BillVatRate = (typeof BillVatRate)[keyof typeof BillVatRate];

export const billVatRateLabels: Record<BillVatRate, string> = {
  [BillVatRate.Pdv25]: "PDV 25%",
  [BillVatRate.Pdv0]: "PDV 0%",
  [BillVatRate.ReverseCharge]: "Prijenos porezne obveze",
};