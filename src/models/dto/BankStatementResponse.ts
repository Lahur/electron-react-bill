export interface BankStatementResponse {
  id: string;
  statementId: string;
  iban: string;
  currency: string;
  periodFrom: string;
  periodTo: string;
  createdAt: string;
  sentCount: number;
}