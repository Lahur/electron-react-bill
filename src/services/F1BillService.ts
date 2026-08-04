import type { F1BillRequest } from "../models/dto/F1BillRequest";
import type { BillResponse } from "../models/dto/BillResponse";
import type { BillInfoResponse } from "../models/dto/BillInfoResponse";
import type { BillReviewResponse } from "../models/dto/BillReviewResponse";
import { createApiClient } from "./httpClient";

const f1BillApi = createApiClient("/bill/f1");

export const F1BillService = {
  async getBills(): Promise<BillResponse[]> {
    const response = await f1BillApi.get<BillResponse[]>("");
    return response.data;
  },

  async createBill(request: F1BillRequest): Promise<BillResponse> {
    const response = await f1BillApi.post<BillResponse>("", request);
    return response.data;
  },

  async getBillInfo(id: number): Promise<BillInfoResponse> {
    const response = await f1BillApi.get<BillInfoResponse>(`/${id}`);
    return response.data;
  },

  async cancelBill(originalId: number): Promise<BillResponse> {
    const response = await f1BillApi.post<BillResponse>("/cancel", null, {
      params: { originalId },
    });
    return response.data;
  },

  async reviewBill(request: F1BillRequest): Promise<BillReviewResponse> {
    const response = await f1BillApi.post<BillReviewResponse>("/review", request);
    return response.data;
  },
};

export default F1BillService;