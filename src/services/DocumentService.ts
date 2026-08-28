import type {SendBillReportsRequest} from "../models/dto/SendBillReportsRequest";
import {createApiClient} from "./httpClient";

const documentApi = createApiClient("/document");

export const DocumentService = {
  async generateAndSend(request: SendBillReportsRequest): Promise<void> {
    await documentApi.post<void>("/generate-and-send", request);
  },
};

export default DocumentService;