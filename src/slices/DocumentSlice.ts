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

export const generateAndSendDocuments = createAsyncThunk<void, string, { state: RootState }>(
    'document/generateAndSend',
    (email, { getState }) => {
        const { reportItems } = getState().document;
        const request: SendBillReportsRequest = { reports: reportItems, email };
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