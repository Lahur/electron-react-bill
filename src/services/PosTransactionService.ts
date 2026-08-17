import type { PosTransactionResponse } from "../models/dto/PosTransactionResponse";
import type { PosTransactionGenerateAndSendRequest } from "../models/dto/PosTransactionGenerateAndSendRequest";
import { createApiClient } from "./httpClient";

const posTransactionApi = createApiClient("/pos-transaction");

export const PosTransactionService = {
  async findAll(): Promise<PosTransactionResponse[]> {
    const response = await posTransactionApi.get<PosTransactionResponse[]>("");
    return response.data;
  },

  async upload(id: string, file: File): Promise<PosTransactionResponse> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await posTransactionApi.post<PosTransactionResponse>(`/${id}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async generateAndSend(request: PosTransactionGenerateAndSendRequest): Promise<void> {
    await posTransactionApi.post<void>("/generate-and-send", request);
  },
};

export default PosTransactionService;