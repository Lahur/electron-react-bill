export const BillDocumentKind = {
  CommercialInvoice: "CommercialInvoice",
  CreditNote: "CreditNote",
  DebitNote: "DebitNote",
  SelfBilledInvoice: "SelfBilledInvoice",
  CorrectedInvoice: "CorrectedInvoice",
  Training: "Training",
  Copy: "Copy",
} as const;

export type BillDocumentKind = (typeof BillDocumentKind)[keyof typeof BillDocumentKind];

export const billDocumentKindLabels: Record<BillDocumentKind, string> = {
  [BillDocumentKind.CommercialInvoice]: "Račun",
  [BillDocumentKind.CreditNote]: "Odobrenje",
  [BillDocumentKind.DebitNote]: "Zaduženje",
  [BillDocumentKind.SelfBilledInvoice]: "Samofakturiranje",
  [BillDocumentKind.CorrectedInvoice]: "Ispravljeni račun",
  [BillDocumentKind.Training]: "Testni",
  [BillDocumentKind.Copy]: "Kopija",
};