export const BillType = {
  F1_BILL: "F1_BILL",
  F2_BILL: "F2_BILL",
  F2_REPORT: "F2_REPORT",
  INGOING_BILL: "INGOING_BILL",
} as const;

export type BillType = (typeof BillType)[keyof typeof BillType];