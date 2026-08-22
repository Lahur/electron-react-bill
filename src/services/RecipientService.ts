import { createApiClient } from "./httpClient";

const recipientApi = createApiClient("/recipient");

export const RecipientService = {
  async findAll(): Promise<string[]> {
    const response = await recipientApi.get<string[]>("");
    return response.data;
  },
};

export default RecipientService;
