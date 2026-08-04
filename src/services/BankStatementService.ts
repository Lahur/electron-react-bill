import type { BankStatementResponse } from "../models/dto/BankStatementResponse";
import { createApiClient } from "./httpClient";

const bankStatementApi = createApiClient("/bank-statement");

export const BankStatementService = {
  async findAll(): Promise<BankStatementResponse[]> {
    const response = await bankStatementApi.get<BankStatementResponse[]>("");
    return response.data;
  },

  async upload(files: File[]): Promise<BankStatementResponse[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const response = await bankStatementApi.post<BankStatementResponse[]>("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

export default BankStatementService;