import type {SubmitEvent} from "react";
import {useCallback, useState} from "react";
import {useNavigate} from "react-router";
import ComponentCard from "../../../components/common/ComponentCard.tsx";
import Label from "../../../components/form/Label.tsx";
import Input from "../../../components/form/input/InputField.tsx";
import TextArea from "../../../components/form/input/TextArea.tsx";
import Select from "../../../components/form/Select.tsx";
import DatePicker from "../../../components/form/date-picker.tsx";
import Button from "../../../components/ui/button/Button.tsx";
import {useAppDispatch, useAppSelector} from "../../../app/hooks";
import {resetBusinessEntityCheck} from "../../../slices/BusinessEntitySlice";
import {createBill, reviewBill} from "../../../slices/B2CBillSlice";
import type {F1BillRequest} from "../../../models/dto/F1BillRequest";
import type {BillReviewResponse} from "../../../models/dto/BillReviewResponse";
import {F1TaxRate, f1TaxRateLabels} from "../../../models/enums/F1TaxRate";
import ReviewBill from "./ReviewBill.tsx";

function toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

const taxRateOptions: { value: string; label: string }[] = Object.values(F1TaxRate).map(
    (value) => ({ value: String(value), label: f1TaxRateLabels[value] }),
);

interface B2CBillFormState {
    billDate: string;
    billTime: string;
    dueDate: string;
    note: string;
    buyerName: string;
    buyerAddress: string;
    buyerCity: string;
    buyerPostalCode: string;
    baseAmount: string;
    taxRate: string;
    billItemName: string;
    billItemDescription: string;
}

const initialFormState: B2CBillFormState = {
    billDate: "",
    billTime: "",
    dueDate: "",
    note: "",
    buyerName: "",
    buyerAddress: "",
    buyerCity: "",
    buyerPostalCode: "",
    baseAmount: "",
    taxRate: "",
    billItemName: "",
    billItemDescription: "",
};

export default function B2CBillFormCard({ onCancel }: { onCancel: () => void }) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const business = useAppSelector((state) => state.businessEntity.checkResult);
    const checkedOib = useAppSelector((state) => state.businessEntity.checkedOib);
    const entity = business?.businessEntity;

    const [form, setForm] = useState<B2CBillFormState>(initialFormState);
    const [errors, setErrors] = useState<Partial<Record<keyof B2CBillFormState, boolean>>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [pendingRequest, setPendingRequest] = useState<F1BillRequest | null>(null);
    const [billReview, setBillReview] = useState<BillReviewResponse | null>(null);

    const setField = useCallback(<K extends keyof B2CBillFormState>(field: K, value: B2CBillFormState[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleBillDateChange = useCallback((dates: Date[]) => {
        if (dates[0]) setField("billDate", toIsoDate(dates[0]));
    }, [setField]);

    const handleDueDateChange = useCallback((dates: Date[]) => {
        if (dates[0]) setField("dueDate", toIsoDate(dates[0]));
    }, [setField]);

    const handleBillTimeChange = useCallback((_dates: Date[], dateStr: string) => {
        setField("billTime", dateStr);
    }, [setField]);

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors: Partial<Record<keyof B2CBillFormState, boolean>> = {};
        if (!form.billDate) newErrors.billDate = true;
        if (!form.billTime) newErrors.billTime = true;
        if (!form.dueDate) newErrors.dueDate = true;
        if (form.baseAmount === "" || Number(form.baseAmount) < 0) newErrors.baseAmount = true;
        if (!form.taxRate) newErrors.taxRate = true;
        if (!form.billItemName) newErrors.billItemName = true;
        if (!form.billItemDescription) newErrors.billItemDescription = true;
        if (!entity) {
            if (!form.buyerName) newErrors.buyerName = true;
            if (!form.buyerAddress) newErrors.buyerAddress = true;
            if (!form.buyerCity) newErrors.buyerCity = true;
            if (!form.buyerPostalCode) newErrors.buyerPostalCode = true;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setSubmitError(null);
        setSubmitting(true);

        const request: F1BillRequest = {
            billDate: form.billDate,
            billTime: form.billTime,
            dueDate: form.dueDate,
            note: form.note || undefined,
            buyerOib: entity ? entity.oib : (checkedOib ?? ""),
            buyerName: entity ? entity.name : form.buyerName,
            buyerAddress: entity ? entity.headquatersAddress : form.buyerAddress,
            buyerCity: entity ? entity.headquatersCity : form.buyerCity,
            buyerPostalCode: entity ? entity.headquatersZip : form.buyerPostalCode,
            baseAmount: Number(form.baseAmount),
            taxRate: Number(form.taxRate) as F1TaxRate,
            billItemName: form.billItemName,
            billItemDescription: form.billItemDescription,
        };

        try {
            const review = await dispatch(reviewBill(request)).unwrap();
            setPendingRequest(request);
            setBillReview(review);
        } catch {
            setSubmitError("Pregled računa nije uspio. Pokušajte ponovno.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        setPendingRequest(null);
        setBillReview(null);
        setSubmitError(null);
    };

    const handleConfirm = async () => {
        if (!pendingRequest) return;

        setSubmitError(null);
        setSubmitting(true);

        try {
            await dispatch(createBill(pendingRequest)).unwrap();
            dispatch(resetBusinessEntityCheck());
            navigate("/bills/outgoing/b2c");
        } catch {
            setSubmitError("Izrada računa nije uspjela. Pokušajte ponovno.");
        } finally {
            setSubmitting(false);
        }
    };

    if (billReview) {
        return (
            <ReviewBill
                billReview={billReview}
                onConfirm={handleConfirm}
                onBack={handleBack}
                submitting={submitting}
                submitError={submitError}
            />
        );
    }

    return (
        <ComponentCard title="Novi račun">
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <DatePicker
                                id="billDate"
                                label="Datum računa"
                                placeholder="Odaberite datum računa"
                                onChange={handleBillDateChange}
                            />
                            {errors.billDate && (
                                <p className="mt-1.5 text-xs text-error-500">Datum računa je obavezan.</p>
                            )}
                        </div>
                        <div>
                            <DatePicker
                                id="billTime"
                                label="Vrijeme računa"
                                placeholder="Odaberite vrijeme računa"
                                noCalendar
                                enableTime
                                onChange={handleBillTimeChange}
                            />
                            {errors.billTime && (
                                <p className="mt-1.5 text-xs text-error-500">Vrijeme računa je obavezno.</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <DatePicker
                            id="dueDate"
                            label="Datum dospijeća"
                            placeholder="Odaberite datum dospijeća"
                            onChange={handleDueDateChange}
                        />
                        {errors.dueDate && (
                            <p className="mt-1.5 text-xs text-error-500">Datum dospijeća je obavezan.</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="note">Napomena</Label>
                        <TextArea
                            value={form.note}
                            onChange={(value) => setField("note", value)}
                        />
                    </div>

                    {!entity && (
                        <>
                            <div>
                                <Label htmlFor="buyerName">Naziv kupca</Label>
                                <Input
                                    type="text"
                                    id="buyerName"
                                    value={form.buyerName}
                                    onChange={(e) => setField("buyerName", e.target.value)}
                                    error={errors.buyerName}
                                    hint={errors.buyerName ? "Naziv kupca je obavezan." : ""}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="buyerAddress">Adresa kupca</Label>
                                    <Input
                                        type="text"
                                        id="buyerAddress"
                                        value={form.buyerAddress}
                                        onChange={(e) => setField("buyerAddress", e.target.value)}
                                        error={errors.buyerAddress}
                                        hint={errors.buyerAddress ? "Adresa kupca je obavezna." : ""}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="buyerCity">Grad kupca</Label>
                                    <Input
                                        type="text"
                                        id="buyerCity"
                                        value={form.buyerCity}
                                        onChange={(e) => setField("buyerCity", e.target.value)}
                                        error={errors.buyerCity}
                                        hint={errors.buyerCity ? "Grad kupca je obavezan." : ""}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="buyerPostalCode">Poštanski broj kupca</Label>
                                <Input
                                    type="text"
                                    id="buyerPostalCode"
                                    value={form.buyerPostalCode}
                                    onChange={(e) => setField("buyerPostalCode", e.target.value)}
                                    error={errors.buyerPostalCode}
                                    hint={errors.buyerPostalCode ? "Poštanski broj kupca je obavezan." : ""}
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <Label htmlFor="billItemName">Naziv stavke</Label>
                        <Input
                            type="text"
                            id="billItemName"
                            value={form.billItemName}
                            onChange={(e) => setField("billItemName", e.target.value)}
                            error={errors.billItemName}
                            hint={errors.billItemName ? "Naziv stavke je obavezan." : ""}
                        />
                    </div>
                    <div>
                        <Label htmlFor="billItemDescription">Opis stavke</Label>
                        <TextArea
                            value={form.billItemDescription}
                            onChange={(value) => setField("billItemDescription", value)}
                            error={errors.billItemDescription}
                            hint={errors.billItemDescription ? "Opis stavke je obavezan." : ""}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="baseAmount">Osnovica</Label>
                            <Input
                                type="number"
                                id="baseAmount"
                                min="0"
                                value={form.baseAmount}
                                onChange={(e) => setField("baseAmount", e.target.value)}
                                error={errors.baseAmount}
                                hint={errors.baseAmount ? "Osnovica mora biti 0 ili veća." : ""}
                            />
                        </div>
                        <div>
                            <Label htmlFor="taxRate">Porezna stopa</Label>
                            <Select
                                options={taxRateOptions}
                                placeholder="Odaberite poreznu stopu"
                                onChange={(value) => setField("taxRate", value)}
                            />
                            {errors.taxRate && (
                                <p className="mt-1.5 text-xs text-error-500">Porezna stopa je obavezna.</p>
                            )}
                        </div>
                    </div>

                    {submitError && (
                        <p className="text-sm text-error-500">{submitError}</p>
                    )}

                    <div className="flex items-center gap-3">
                        <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={submitting}>
                            Odustani
                        </Button>
                        <Button type="submit" size="sm" variant="primary" className="ml-auto" disabled={submitting}>
                            Pregledaj
                        </Button>
                    </div>
                </div>
            </form>
        </ComponentCard>
    );
}
