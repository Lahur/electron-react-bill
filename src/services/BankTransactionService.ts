import type {BankTransactionResponse} from "../models/dto/BankTransactionResponse";
import {createApiClient} from "./httpClient";

const bankTransactionApi = createApiClient("/bank-transaction");

export const BankTransactionService = {
  async findAllByBankStatementId(bankStatementId: string): Promise<BankTransactionResponse[]> {
    const response = await bankTransactionApi.get<BankTransactionResponse[]>(`/bank-statement/${bankStatementId}`);
    return response.data;
  },
};

export default BankTransactionService;
