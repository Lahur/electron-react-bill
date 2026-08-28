import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import DashboardService from "../../services/DashboardService";
import type {DailyTotalResponse} from "../../models/dto/DailyTotalResponse";

interface DashboardState {
  summary: {
    salesPaidTotal: number;
    salesUnpaidTotal: number;
    purchasesPaidTotal: number;
    purchasesUnpaidTotal: number;
  };
  monthlySales: {
    categories: string[];
    data: number[];
  };
  statistics: {
    categories: string[];
    salesPaid: number[];
    salesUnpaid: number[];
  };
}

const initialState: DashboardState = {
  summary: {
    salesPaidTotal: 0,
    salesUnpaidTotal: 0,
    purchasesPaidTotal: 0,
    purchasesUnpaidTotal: 0,
  },
  monthlySales: {
    categories: [],
    data: [],
  },
  statistics: {
    categories: [],
    salesPaid: [],
    salesUnpaid: [],
  },
};

const monthYearFormatter = new Intl.DateTimeFormat("hr-HR", { month: "short", year: "numeric" });

function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function groupByWeek(dailyTotals: DailyTotalResponse[]): { categories: string[]; data: number[] } {
  const categories: string[] = [];
  const data: number[] = [];
  for (let i = 0; i < dailyTotals.length; i += 7) {
    const week = dailyTotals.slice(i, i + 7);
    const startDay = parseIsoDate(week[0].date).getDate();
    const endDay = parseIsoDate(week[week.length - 1].date).getDate();
    categories.push(startDay === endDay ? `${startDay}` : `${startDay}–${endDay}`);
    data.push(week.reduce((sum, d) => sum + d.total, 0));
  }
  return { categories, data };
}

export const fetchDashboardSummary = createAsyncThunk(
  "dashboard/fetchSummary",
  () => DashboardService.getSummary(),
);

export const fetchMonthlySales = createAsyncThunk(
  "dashboard/fetchMonthlySales",
  async () => {
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    const dailyTotals = await DashboardService.getDailySales(from, today);
    return groupByWeek(dailyTotals);
  },
);

export const fetchStatistics = createAsyncThunk(
  "dashboard/fetchStatistics",
  async () => {
    const summaries = await DashboardService.getMonthlySummaries(12);
    return {
      categories: summaries.map((s) => monthYearFormatter.format(parseIsoDate(s.month))),
      salesPaid: summaries.map((s) => s.salesPaidTotal),
      salesUnpaid: summaries.map((s) => s.salesUnpaidTotal),
    };
  },
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      .addCase(fetchMonthlySales.fulfilled, (state, action) => {
        state.monthlySales = action.payload;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      });
  },
});

export default dashboardSlice.reducer;