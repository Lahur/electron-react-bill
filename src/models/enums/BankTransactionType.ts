export const BankTransactionType = {
  POS_PAY: "POS_PAY",
  BANK_WITHDRAWAL: "BANK_WITHDRAWAL",
  TRANSACTION: "TRANSACTION",
} as const;

export type BankTransactionType = (typeof BankTransactionType)[keyof typeof BankTransactionType];

export const bankTransactionTypeLabels: Record<BankTransactionType, string> = {
  [BankTransactionType.POS_PAY]: "POS plaćanje",
  [BankTransactionType.BANK_WITHDRAWAL]: "Podizanje gotovine",
  [BankTransactionType.TRANSACTION]: "Transakcija",
};
