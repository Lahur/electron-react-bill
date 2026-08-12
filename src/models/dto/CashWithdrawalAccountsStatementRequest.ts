export interface CashWithdrawalAccountsStatementRequest {
  cashWithdrawalIds: Record<number, string>;
  amount: number;
  description: string;
  date: string;
}