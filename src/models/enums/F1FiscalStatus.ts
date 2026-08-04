export const F1FiscalStatus = {
  Pending: "Pending",
  Success: "Success",
  Failed: "Failed",
  RetryPending: "RetryPending",
  LateDelivery: "LateDelivery",
  NotRequired: "NotRequired",
} as const;

export type F1FiscalStatus = (typeof F1FiscalStatus)[keyof typeof F1FiscalStatus];

export const f1FiscalStatusLabels: Record<F1FiscalStatus, string> = {
  [F1FiscalStatus.Pending]: "Na čekanju",
  [F1FiscalStatus.Success]: "Uspješno",
  [F1FiscalStatus.Failed]: "Neuspješno",
  [F1FiscalStatus.RetryPending]: "Ponovni pokušaj na čekanju",
  [F1FiscalStatus.LateDelivery]: "Zakašnjela dostava",
  [F1FiscalStatus.NotRequired]: "Nije potrebno",
};
