import type {F2BillRequest} from "../models/dto/F2BillRequest";
import type {BillResponse} from "../models/dto/BillResponse";
import type {BillReviewResponse} from "../models/dto/BillReviewResponse";
import type {BillInfoResponse} from "../models/dto/BillInfoResponse";
import type {BillSearchParams} from "../models/dto/BillSearchParams";
import {createApiClient} from "./httpClient";

const f2BillApi = createApiClient("/bill/f2");

export const F2BillService = {
  async getBills(): Promise<BillResponse[]> {
    const response = await f2BillApi.get<BillResponse[]>("");
    return response.data;
  },

  async getBillsFilter(params: BillSearchParams): Promise<BillResponse[]> {
    const response = await f2BillApi.post<BillResponse[]>("/filter", params);
    return response.data;
  },

  async createBill(request: F2BillRequest, orderDocument?: File | null): Promise<BillResponse> {
    const formData = new FormData();
    formData.append("request", new Blob([JSON.stringify(request)], { type: "application/json" }));
    if (orderDocument) {
      formData.append("orderDocument", orderDocument);
    }
    const response = await f2BillApi.post<BillResponse>("", formData);
    return response.data;
  },

  async getBillInfo(id: number): Promise<BillInfoResponse> {
    const response = await f2BillApi.get<BillInfoResponse>(`/${id}`);
    return response.data;
  },

  async cancelBill(originalId: number, newId: number): Promise<BillResponse> {
    const response = await f2BillApi.post<BillResponse>("/cancel", null, {
      params: { originalId, newId },
    });
    return response.data;
  },

  async reviewBill(request: F2BillRequest): Promise<BillReviewResponse> {
    const response = await f2BillApi.post<BillReviewResponse>("/review", request);
    return response.data;
  },
};

export default F2BillService;