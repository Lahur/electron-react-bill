export const BillReportType = {
  F1_OUTGOING: "F1_OUTGOING",
  F2_OUTGOING: "F2_OUTGOING",
  INGOING: "INGOING",
  F2_REPORT: "F2_REPORT",
  CASH_WITHDRAWAL: "CASH_WITHDRAWAL",
  ACCOUNTS_STATEMENT: "ACCOUNTS_STATEMENT",
  POS: "POS",
} as const;

export type BillReportType = (typeof BillReportType)[keyof typeof BillReportType];

export const billReportTypeLabels: Record<BillReportType, string> = {
  [BillReportType.F1_OUTGOING]: "F1 - Izlazni račun",
  [BillReportType.F2_OUTGOING]: "F2 - Izlazni račun",
  [BillReportType.INGOING]: "Ulazni račun",
  [BillReportType.F2_REPORT]: "F2 - Prijava računa",
  [BillReportType.CASH_WITHDRAWAL]: "Stanje blagajne",
  [BillReportType.ACCOUNTS_STATEMENT]: "Blagajnički izvještaj",
  [BillReportType.POS]: "POS transakcija",
};