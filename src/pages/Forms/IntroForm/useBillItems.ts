import {useCallback, useState} from "react";
import type {BillItemRequest} from "../../../models/dto/BillItemRequest";

export interface BillItemFormState {
    id: number;
    billItemName: string;
    billItemDescription: string;
    baseAmount: string;
}

type EditableField = keyof Omit<BillItemFormState, "id">;
type BillItemErrors = Partial<Record<EditableField, boolean>>;

let nextItemId = 1;

function createEmptyItem(): BillItemFormState {
    return { id: nextItemId++, billItemName: "", billItemDescription: "", baseAmount: "" };
}

/**
 * State for a dynamic list of bill items (BaseBillRequest.items on the backend).
 * `validate` mirrors BillItemRequest constraints: name and description required, base amount > 0.
 */
export function useBillItems() {
    const [items, setItems] = useState<BillItemFormState[]>(() => [createEmptyItem()]);
    const [itemErrors, setItemErrors] = useState<Record<number, BillItemErrors>>({});

    const setItemField = useCallback((id: number, field: EditableField, value: string) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    }, []);

    const addItem = useCallback(() => {
        setItems((prev) => [...prev, createEmptyItem()]);
    }, []);

    const removeItem = useCallback((id: number) => {
        setItems((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
        setItemErrors((prev) => {
            const rest = { ...prev };
            delete rest[id];
            return rest;
        });
    }, []);

    /** Validates all items, stores the errors and returns true when every item is valid. */
    const validate = useCallback((): boolean => {
        const errors: Record<number, BillItemErrors> = {};
        for (const item of items) {
            const itemError: BillItemErrors = {};
            if (!item.billItemName.trim()) itemError.billItemName = true;
            if (!item.billItemDescription.trim()) itemError.billItemDescription = true;
            if (item.baseAmount === "" || !(Number(item.baseAmount) > 0)) itemError.baseAmount = true;
            if (Object.keys(itemError).length > 0) errors[item.id] = itemError;
        }
        setItemErrors(errors);
        return Object.keys(errors).length === 0;
    }, [items]);

    const toRequest = useCallback((): BillItemRequest[] => items.map((item) => ({
        baseAmount: Number(item.baseAmount),
        billItemName: item.billItemName.trim(),
        billItemDescription: item.billItemDescription.trim(),
    })), [items]);

    return { items, itemErrors, setItemField, addItem, removeItem, validate, toRequest };
}
