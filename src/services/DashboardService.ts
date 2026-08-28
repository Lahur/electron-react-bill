import type {DashboardSummaryResponse} from "../models/dto/DashboardSummaryResponse";
import type {DailyTotalResponse} from "../models/dto/DailyTotalResponse";
import type {MonthlySummaryResponse} from "../models/dto/MonthlySummaryResponse";
import {createApiClient} from "./httpClient";

const dashboardApi = createApiClient("/dashboard");

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const DashboardService = {
  async getSummary(): Promise<DashboardSummaryResponse> {
    const response = await dashboardApi.get<DashboardSummaryResponse>("/summary");
    return response.data;
  },

  async getDailySales(from: Date, to: Date): Promise<DailyTotalResponse[]> {
    const response = await dashboardApi.get<DailyTotalResponse[]>("/daily-sales", {
      params: { from: toIsoDate(from), to: toIsoDate(to) },
    });
    return response.data;
  },

  async getMonthlySummaries(months = 12): Promise<MonthlySummaryResponse[]> {
    const response = await dashboardApi.get<MonthlySummaryResponse[]>("/monthly-summary", {
      params: { months },
    });
    return response.data;
  },
};

export default DashboardService;