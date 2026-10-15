import type {BankTransactionType} from "../enums/BankTransactionType";
import type {CreditDebitIndicator} from "../enums/CreditDebitIndicator";

export interface BankTransactionResponse {
  id: string;
  bankStatementId: string;
  amount: number;
  creditDebitIndicator: CreditDebitIndicator;
  senderIban: string | null;
  receiverIban: string | null;
  counterpartyName: string | null;
  reference: string | null;
  payerReference: string | null;
  transactionReference: string | null;
  additionalRemittanceInfo: string | null;
  transactionDate: string;
  valueDate: string | null;
  transactionType: BankTransactionType;
  billSystemId: string | null;
}
