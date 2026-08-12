import type { CashWithdrawalBalanceResponse } from "../models/dto/CashWithdrawalBalanceResponse";
import type { CashWithdrawalAccountsStatementRequest } from "../models/dto/CashWithdrawalAccountsStatementRequest";
import { createApiClient } from "./httpClient";

const cashWithdrawalBalanceApi = createApiClient("/cash-withdrawal-balance");

export const CashWithdrawalBalanceService = {
  async findAll(): Promise<CashWithdrawalBalanceResponse[]> {
    const response = await cashWithdrawalBalanceApi.get<CashWithdrawalBalanceResponse[]>("");
    return response.data;
  },

  async createAccountsStatement(
    request: CashWithdrawalAccountsStatementRequest,
    file: File | null,
  ): Promise<CashWithdrawalBalanceResponse[]> {
    const formData = new FormData();
    formData.append("request", new Blob([JSON.stringify(request)], { type: "application/json" }));
    if (file) formData.append("file", file);
    const response = await cashWithdrawalBalanceApi.post<CashWithdrawalBalanceResponse[]>(
      "/accounts-statement",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },
};

export default CashWithdrawalBalanceService;