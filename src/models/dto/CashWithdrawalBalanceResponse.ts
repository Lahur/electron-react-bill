export interface CashWithdrawalBalanceResponse {
  id: string;
  total: number;
  balance: number;
  bankTransactionId: string;
  amount: number;
  additionalRemittanceInfo: string;
  transactionDate: string;
  accountsStatementIds: string[];
  sentCount: number;
}
