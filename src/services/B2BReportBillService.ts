import type { ReportBillRequest } from "../models/dto/ReportBillRequest";
import type { BillResponse } from "../models/dto/BillResponse";
import type { BillReviewResponse } from "../models/dto/BillReviewResponse";
import type { BillInfoResponse } from "../models/dto/BillInfoResponse";
import { createApiClient } from "./httpClient";

const b2bReportBillApi = createApiClient("/bill/f2-report");

export const B2BReportBillService = {
  async getBills(): Promise<BillResponse[]> {
    const response = await b2bReportBillApi.get<BillResponse[]>("");
    return response.data;
  },

  async createBill(request: ReportBillRequest): Promise<BillResponse> {
    const response = await b2bReportBillApi.post<BillResponse>("", request);
    return response.data;
  },

  async getBillInfo(id: string): Promise<BillInfoResponse> {
    const response = await b2bReportBillApi.get<BillInfoResponse>(`/${id}`);
    return response.data;
  },

  async cancelBill(originalId: number, newId: number): Promise<BillResponse> {
    const response = await b2bReportBillApi.post<BillResponse>("/cancel", null, {
      params: { originalId, newId },
    });
    return response.data;
  },

  async reviewBill(request: ReportBillRequest): Promise<BillReviewResponse> {
    const response = await b2bReportBillApi.post<BillReviewResponse>("/review", request);
    return response.data;
  },
};

export default B2BReportBillService;