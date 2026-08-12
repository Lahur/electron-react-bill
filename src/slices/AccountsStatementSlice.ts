import type { AccountsStatementResponse } from "../models/dto/AccountsStatementResponse";
import type { CreateAccountsStatementRequest } from "../models/dto/CreateAccountsStatementRequest";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AccountsStatementService } from "../services/AccountsStatementService";

interface AccountsStatementState {
    statements: AccountsStatementResponse[];
}

const initialState: AccountsStatementState = {
    statements: [],
};

export const fetchAccountsStatements = createAsyncThunk(
    'accountsStatement/fetchAll',
    () => AccountsStatementService.findAll(),
);

export const createAccountsStatement = createAsyncThunk(
    'accountsStatement/create',
    ({ request, file }: { request: CreateAccountsStatementRequest; file: File | null }) =>
        AccountsStatementService.create(request, file),
);

export const uploadAccountsStatementBill = createAsyncThunk(
    'accountsStatement/upload',
    ({ id, file }: { id: string; file: File }) => AccountsStatementService.upload(id, file),
);

const accountsStatementSlice = createSlice({
    name: 'accountsStatement',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAccountsStatements.fulfilled, (state, action) => { state.statements = action.payload; })
            .addCase(createAccountsStatement.fulfilled, (state, action) => { state.statements.unshift(action.payload); })
            .addCase(uploadAccountsStatementBill.fulfilled, (state, action) => {
                const statement = state.statements.find((s) => s.id === action.payload.id);
                if (statement) statement.hasBill = true;
            })
    },});

export default accountsStatementSlice.reducer;