import FormField from "@/components/form/FormField";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import type {useBillItems} from "./useBillItems.ts";
import {PlusIcon, TrashBinIcon} from "@/icons";

export default function BillItemsEditor({
    items,
    itemErrors,
    setItemField,
    addItem,
    removeItem,
}: Pick<ReturnType<typeof useBillItems>, "items" | "itemErrors" | "setItemField" | "addItem" | "removeItem">) {
    return (
        <div className="border-t border-gray-100 pt-6 dark:border-gray-800">
            <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    Stavke računa
                </h4>
                <Button type="button" size="sm" variant="outline" onClick={addItem}>
                    <PlusIcon className="size-4" />
                    Dodaj stavku
                </Button>
            </div>

            <div className="space-y-4">
                {items.map((item, index) => {
                    const itemError = itemErrors[item.id] ?? {};
                    return (
                        <div
                            key={item.id}
                            className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                                    Stavka {index + 1}
                                </span>
                                {items.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        className="text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-500"
                                        onClick={() => removeItem(item.id)}
                                        aria-label={`Ukloni stavku ${index + 1}`}
                                    >
                                        <TrashBinIcon className="size-5" />
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FormField
                                        label="Naziv stavke"
                                        htmlFor={`billItemName-${item.id}`}
                                        error={itemError.billItemName ? "Naziv stavke je obavezan." : undefined}
                                    >
                                        <Input
                                            type="text"
                                            id={`billItemName-${item.id}`}
                                            value={item.billItemName}
                                            onChange={(e) => setItemField(item.id, "billItemName", e.target.value)}
                                            aria-invalid={itemError.billItemName || undefined}
                                        />
                                    </FormField>
                                    <FormField
                                        label="Osnovica"
                                        htmlFor={`baseAmount-${item.id}`}
                                        error={itemError.baseAmount ? "Osnovica mora biti veća od 0." : undefined}
                                    >
                                        <Input
                                            type="number"
                                            id={`baseAmount-${item.id}`}
                                            min="0"
                                            step={0.01}
                                            value={item.baseAmount}
                                            onChange={(e) => setItemField(item.id, "baseAmount", e.target.value)}
                                            aria-invalid={itemError.baseAmount || undefined}
                                        />
                                    </FormField>
                                </div>
                                <FormField
                                    label="Opis stavke"
                                    htmlFor={`billItemDescription-${item.id}`}
                                    error={itemError.billItemDescription ? "Opis stavke je obavezan." : undefined}
                                >
                                    <Textarea
                                        id={`billItemDescription-${item.id}`}
                                        rows={3}
                                        value={item.billItemDescription}
                                        onChange={(e) => setItemField(item.id, "billItemDescription", e.target.value)}
                                        aria-invalid={itemError.billItemDescription || undefined}
                                    />
                                </FormField>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
