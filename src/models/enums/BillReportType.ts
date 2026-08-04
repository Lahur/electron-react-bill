export const BillReportType = {
  F1_OUTGOING: "F1_OUTGOING",
  F2_OUTGOING: "F2_OUTGOING",
  INGOING: "INGOING",
  F2_REPORT: "F2_REPORT",
} as const;

export type BillReportType = (typeof BillReportType)[keyof typeof BillReportType];

export const billReportTypeLabels: Record<BillReportType, string> = {
  [BillReportType.F1_OUTGOING]: "F1 - Izlazni račun",
  [BillReportType.F2_OUTGOING]: "F2 - Izlazni račun",
  [BillReportType.INGOING]: "Ulazni račun",
  [BillReportType.F2_REPORT]: "F2 - Prijava računa",
};