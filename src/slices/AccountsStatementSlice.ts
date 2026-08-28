import type {AccountsStatementResponse} from "../models/dto/AccountsStatementResponse";
import type {CreateAccountsStatementRequest} from "../models/dto/CreateAccountsStatementRequest";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {AccountsStatementService} from "../services/AccountsStatementService";

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

export const syncAccountsStatements = createAsyncThunk(
    'accountsStatement/sync',
    (accountsStatementIds: string[]) => AccountsStatementService.sync(accountsStatementIds),
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
            .addCase(syncAccountsStatements.fulfilled, (state, action) => {
                action.payload.forEach((updated) => {
                    const index = state.statements.findIndex((s) => s.id === updated.id);
                    if (index !== -1) state.statements[index] = updated;
                });
            })
    },});

export default accountsStatementSlice.reducer;