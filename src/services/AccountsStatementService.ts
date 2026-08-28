import type {AccountsStatementResponse} from "../models/dto/AccountsStatementResponse";
import type {CreateAccountsStatementRequest} from "../models/dto/CreateAccountsStatementRequest";
import {createApiClient} from "./httpClient";

const accountsStatementApi = createApiClient("/accounts-statement");

export const AccountsStatementService = {
  async findAll(): Promise<AccountsStatementResponse[]> {
    const response = await accountsStatementApi.get<AccountsStatementResponse[]>("");
    return response.data;
  },

  async create(request: CreateAccountsStatementRequest, file: File | null): Promise<AccountsStatementResponse> {
    const formData = new FormData();
    formData.append("request", new Blob([JSON.stringify(request)], { type: "application/json" }));
    if (file) formData.append("file", file);
    const response = await accountsStatementApi.post<AccountsStatementResponse>("", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async upload(id: string, file: File): Promise<AccountsStatementResponse> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await accountsStatementApi.post<AccountsStatementResponse>(`/${id}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async sync(accountsStatementIds: string[]): Promise<AccountsStatementResponse[]> {
    const response = await accountsStatementApi.post<AccountsStatementResponse[]>("/sync", accountsStatementIds);
    return response.data;
  },
};

export default AccountsStatementService;