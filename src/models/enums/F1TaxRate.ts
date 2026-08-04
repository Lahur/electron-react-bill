export const F1TaxRate = {
  Pdv25: 25,
  Pdv0: 0,
} as const;

export type F1TaxRate = (typeof F1TaxRate)[keyof typeof F1TaxRate];

export const f1TaxRateLabels: Record<F1TaxRate, string> = {
  [F1TaxRate.Pdv25]: "PDV 25%",
  [F1TaxRate.Pdv0]: "PDV 0%",
};
