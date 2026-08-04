export const VatCategory = {
  Pdv25: "Pdv25",
  ReverseCharge: "ReverseCharge",
} as const;

export type VatCategory = (typeof VatCategory)[keyof typeof VatCategory];

export const vatCategoryLabels: Record<VatCategory, string> = {
  [VatCategory.Pdv25]: "PDV 25%",
  [VatCategory.ReverseCharge]: "Prijenos porezne obveze",
};