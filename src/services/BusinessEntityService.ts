import type { BusinessCheckResponse } from "../models/dto/BusinessCheckResponse";
import { createApiClient } from "./httpClient";

const businessEntityApi = createApiClient("/business-entity");

export const BusinessEntityService = {
  async checkByOib(oib: string): Promise<BusinessCheckResponse> {
    const response = await businessEntityApi.get<BusinessCheckResponse>("/check", {
      params: { oib },
    });
    return response.data;
  },
};

export default BusinessEntityService;