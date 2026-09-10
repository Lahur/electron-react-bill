import type {SendBillReportsRequest} from "../models/dto/SendBillReportsRequest";
import {createAsyncThunk, createSlice, type PayloadAction} from "@reduxjs/toolkit";
import {DocumentService} from "../services/DocumentService";
import type {SendBillReportItem} from "../models/dto/SendBillReportItem.ts";
import type {RootState} from "../app/store";

interface DocumentState {
    reportItems: SendBillReportItem[];
}

const initialState: DocumentState = {
    reportItems: []
};

interface GenerateAndSendArgs {
    email: string;
    separated?: boolean;
}

// Backend caps individual (separated) sends at 6 files per email.
export const MAX_SEPARATED_FILES = 6;

export const generateAndSendDocuments = createAsyncThunk<void, GenerateAndSendArgs, { state: RootState }>(
    'document/generateAndSend',
    ({ email, separated }, { getState }) => {
        const { reportItems } = getState().document;
        const request: SendBillReportsRequest = { reports: reportItems, email, separated };
        return DocumentService.generateAndSend(request);
    }
)

const documentSlice = createSlice({
    name: 'document',
    initialState,
    reducers: {
        toggleReportItem: (state, action: PayloadAction<SendBillReportItem>) => {
            const exists = state.reportItems.some((item) => item.id === action.payload.id);
            state.reportItems = exists
                ? state.reportItems.filter((item) => item.id !== action.payload.id)
                : [...state.reportItems, action.payload];
        },
    },
    extraReducers: (builder) => {
        builder
    .addCase(generateAndSendDocuments.fulfilled, (state) => { state.reportItems = []; })
    },});

export const { toggleReportItem } = documentSlice.actions;
export default documentSlice.reducer;