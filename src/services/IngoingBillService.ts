import type { BillResponse } from "../models/dto/BillResponse";
import type { BillInfoResponse } from "../models/dto/BillInfoResponse";
import { createApiClient } from "./httpClient";

const ingoingBillApi = createApiClient("/bill/ingoing");

export const IngoingBillService = {
  async getBills(): Promise<BillResponse[]> {
    const response = await ingoingBillApi.get<BillResponse[]>("");
    return response.data;
  },

  async getBillInfo(id: number): Promise<BillInfoResponse> {
    const response = await ingoingBillApi.get<BillInfoResponse>(`/${id}`);
    return response.data;
  },

  async generatePdf417(id: number): Promise<string | null> {
    const response = await ingoingBillApi.get<string | null>(`/${id}/pdf417`);
    return response.data;
  },

  async markAsPaid(id: number): Promise<void> {
    await ingoingBillApi.post(`/${id}/mark-as-paid`);
  },
};

export default IngoingBillService;