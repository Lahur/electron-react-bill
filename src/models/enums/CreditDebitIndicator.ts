export const CreditDebitIndicator = {
  CRDT: "CRDT",
  DBIT: "DBIT",
} as const;

export type CreditDebitIndicator = (typeof CreditDebitIndicator)[keyof typeof CreditDebitIndicator];
