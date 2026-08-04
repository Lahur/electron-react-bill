export const BillPaymentMethod = {
  Cash: "Cash",
  CreditTransfer: "CreditTransfer",
  BankAccount: "BankAccount",
  BankCard: "BankCard",
  DirectDebit: "DirectDebit",
  StandingAgreement: "StandingAgreement",
  SepaCredit: "SepaCredit",
  SepaDirectDebit: "SepaDirectDebit",
  Other: "Other",
} as const;

export type BillPaymentMethod = (typeof BillPaymentMethod)[keyof typeof BillPaymentMethod];

export const billPaymentMethodLabels: Record<BillPaymentMethod, string> = {
  [BillPaymentMethod.Cash]: "Gotovina",
  [BillPaymentMethod.CreditTransfer]: "Kreditni transfer",
  [BillPaymentMethod.BankAccount]: "Uplata na račun",
  [BillPaymentMethod.BankCard]: "Bankovna kartica",
  [BillPaymentMethod.DirectDebit]: "Direktno terećenje",
  [BillPaymentMethod.StandingAgreement]: "Trajni nalog",
  [BillPaymentMethod.SepaCredit]: "SEPA kreditni transfer",
  [BillPaymentMethod.SepaDirectDebit]: "SEPA direktno terećenje",
  [BillPaymentMethod.Other]: "Ostalo",
};