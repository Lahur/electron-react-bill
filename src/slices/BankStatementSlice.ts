import type {BankStatementResponse} from "../models/dto/BankStatementResponse";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {BankStatementService} from "../services/BankStatementService";

interface BankStatementState {
    statements: BankStatementResponse[];
}

const initialState: BankStatementState = {
    statements: [],
};

export const fetchBankStatements = createAsyncThunk(
    'bankStatement/fetchAll',
    () => BankStatementService.findAll(),
);

export const uploadBankStatements = createAsyncThunk(
    'bankStatement/upload',
    (files: File[]) => BankStatementService.upload(files),
);

const bankStatementSlice = createSlice({
    name: 'bankStatement',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBankStatements.fulfilled, (state, action) => { state.statements = action.payload; })
            .addCase(uploadBankStatements.fulfilled, (state, action) => {
                state.statements = action.payload.concat(state.statements);
            })
    },});

export default bankStatementSlice.reducer;