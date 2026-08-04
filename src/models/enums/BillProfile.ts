export const BillProfile = {
  P1: "P1",
  P2: "P2",
  P3: "P3",
} as const;

export type BillProfile = (typeof BillProfile)[keyof typeof BillProfile];

export const billProfileLabels: Record<BillProfile, string> = {
  [BillProfile.P1]: "P1 - Fakturiranje isporuka po narudžbama na temelju ugovora",
  [BillProfile.P2]: "P2 - Periodično izdavanje računa",
  [BillProfile.P3]: "P3 - Izdavanje računa za isporuke prema samostalnoj narudžbi",
};