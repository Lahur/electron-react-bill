import { useCallback, useState } from "react";
import type { SubmitEvent } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../../components/common/ComponentCard.tsx";
import Label from "../../../components/form/Label.tsx";
import Input from "../../../components/form/input/InputField.tsx";
import TextArea from "../../../components/form/input/TextArea.tsx";
import Select from "../../../components/form/Select.tsx";
import DatePicker from "../../../components/form/date-picker.tsx";
import Button from "../../../components/ui/button/Button.tsx";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { resetBusinessEntityCheck } from "../../../slices/BusinessEntitySlice";
import { createBill, reviewBill } from "../../../slices/B2BReportBillSlice";
import type { ReportBillRequest } from "../../../models/dto/ReportBillRequest";
import type { BillReviewResponse } from "../../../models/dto/BillReviewResponse";
import { BillProfile, billProfileLabels } from "../../../models/enums/BillProfile";
import { VatCategory, vatCategoryLabels } from "../../../models/enums/VatCategory";
import { DocsIcon } from "../../../icons";
import ReviewBill from "./ReviewBill.tsx";

function toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

const billProfileOptions: { value: BillProfile; label: string }[] = Object.values(BillProfile).map(
    (value) => ({ value, label: billProfileLabels[value] }),
);

const vatCategoryOptions: { value: VatCategory; label: string }[] = Object.values(VatCategory).map(
    (value) => ({ value, label: vatCategoryLabels[value] }),
);

interface BillFormState {
    billId: string;
    profile: BillProfile | "";
    billDate: string;
    billTime: string;
    dueDate: string;
    note: string;
    orderNumber: string;
    buyerOib: string;
    buyerName: string;
    buyerStreet: string;
    buyerCity: string;
    buyerPostalZone: string;
    baseAmount: string;
    vatCategory: VatCategory | "";
    billItemName: string;
    billItemDescription: string;
}

const initialBillFormState: BillFormState = {
    billId: "",
    profile: "",
    billDate: "",
    billTime: "",
    dueDate: "",
    note: "",
    orderNumber: "",
    buyerOib: "",
    buyerName: "",
    buyerStreet: "",
    buyerCity: "",
    buyerPostalZone: "",
    baseAmount: "",
    vatCategory: "",
    billItemName: "",
    billItemDescription: "",
};

export default function B2BReportFormCard({ onCancel }: { onCancel: () => void }) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const business = useAppSelector((state) => state.businessEntity.checkResult);
    const entity = business?.businessEntity;

    const [form, setForm] = useState<BillFormState>(initialBillFormState);
    const [errors, setErrors] = useState<Partial<Record<keyof BillFormState, boolean>>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [pendingRequest, setPendingRequest] = useState<ReportBillRequest | null>(null);
    const [billReview, setBillReview] = useState<BillReviewResponse | null>(null);
    const [orderDocument, setOrderDocument] = useState<File | null>(null);

    const setField = useCallback(<K extends keyof BillFormState>(field: K, value: BillFormState[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handlePickOrderDocument = useCallback(async () => {
        const picked = await window.electron.openOrderDocument();
        if (!picked) return;
        setOrderDocument(new File([picked.data], picked.name));
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

        const newErrors: Partial<Record<keyof BillFormState, boolean>> = {};
        if (!form.billId || Number(form.billId) < 1) newErrors.billId = true;
        if (!form.profile) newErrors.profile = true;
        if (!form.billDate) newErrors.billDate = true;
        if (!form.billTime) newErrors.billTime = true;
        if (!form.dueDate) newErrors.dueDate = true;
        if (form.baseAmount === "" || Number(form.baseAmount) < 0) newErrors.baseAmount = true;
        if (!form.vatCategory) newErrors.vatCategory = true;
        if (!form.billItemName) newErrors.billItemName = true;
        if (!form.billItemDescription) newErrors.billItemDescription = true;
        if (orderDocument && !form.orderNumber) newErrors.orderNumber = true;
        if (!entity) {
            if (!form.buyerOib) newErrors.buyerOib = true;
            if (!form.buyerName) newErrors.buyerName = true;
            if (!form.buyerStreet) newErrors.buyerStreet = true;
            if (!form.buyerCity) newErrors.buyerCity = true;
            if (!form.buyerPostalZone) newErrors.buyerPostalZone = true;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setSubmitError(null);
        setSubmitting(true);

        const request: ReportBillRequest = {
            billId: Number(form.billId),
            profile: form.profile as BillProfile,
            billDate: form.billDate,
            billTime: form.billTime,
            dueDate: form.dueDate,
            note: form.note || undefined,
            orderNumber: form.orderNumber || undefined,
            buyerOib: entity ? entity.oib : form.buyerOib,
            buyerName: entity ? entity.name : form.buyerName,
            buyerStreet: entity ? entity.headquatersAddress : form.buyerStreet,
            buyerCity: entity ? entity.headquatersCity : form.buyerCity,
            buyerPostalZone: entity ? entity.headquatersZip : form.buyerPostalZone,
            baseAmount: Number(form.baseAmount),
            vatCategory: form.vatCategory as VatCategory,
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
            await dispatch(createBill({ request: pendingRequest, orderDocument })).unwrap();
            dispatch(resetBusinessEntityCheck());
            navigate("/bills/outgoing/b2b-report");
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
        <ComponentCard title="Nova B2B prijava">
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="billId">Broj računa</Label>
                            <Input
                                type="number"
                                id="billId"
                                min="1"
                                value={form.billId}
                                onChange={(e) => setField("billId", e.target.value)}
                                error={errors.billId}
                                hint={errors.billId ? "Broj računa je obavezan." : ""}
                            />
                        </div>
                        <div>
                            <Label htmlFor="profile">Profil</Label>
                            <Select
                                options={billProfileOptions}
                                placeholder="Odaberite profil"
                                onChange={(value) => setField("profile", value as BillProfile)}
                            />
                            {errors.profile && (
                                <p className="mt-1.5 text-xs text-error-500">Profil je obavezan.</p>
                            )}
                        </div>
                    </div>

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

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="buyerOib">OIB kupca</Label>
                                    <Input
                                        type="text"
                                        id="buyerOib"
                                        value={form.buyerOib}
                                        onChange={(e) => setField("buyerOib", e.target.value)}
                                        error={errors.buyerOib}
                                        hint={errors.buyerOib ? "OIB kupca je obavezan." : ""}
                                    />
                                </div>
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
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="buyerStreet">Ulica kupca</Label>
                                    <Input
                                        type="text"
                                        id="buyerStreet"
                                        value={form.buyerStreet}
                                        onChange={(e) => setField("buyerStreet", e.target.value)}
                                        error={errors.buyerStreet}
                                        hint={errors.buyerStreet ? "Ulica kupca je obavezna." : ""}
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
                                <Label htmlFor="buyerPostalZone">Poštanski broj kupca</Label>
                                <Input
                                    type="text"
                                    id="buyerPostalZone"
                                    value={form.buyerPostalZone}
                                    onChange={(e) => setField("buyerPostalZone", e.target.value)}
                                    error={errors.buyerPostalZone}
                                    hint={errors.buyerPostalZone ? "Poštanski broj kupca je obavezan." : ""}
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
                            <Label htmlFor="vatCategory">Kategorija PDV-a</Label>
                            <Select
                                options={vatCategoryOptions}
                                placeholder="Odaberite kategoriju PDV-a"
                                onChange={(value) => setField("vatCategory", value as VatCategory)}
                            />
                            {errors.vatCategory && (
                                <p className="mt-1.5 text-xs text-error-500">Kategorija PDV-a je obavezna.</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="orderNumber">Referenca</Label>
                            <Input
                                type="text"
                                id="orderNumber"
                                value={form.orderNumber}
                                onChange={(e) => setField("orderNumber", e.target.value)}
                                error={errors.orderNumber}
                                hint={errors.orderNumber ? "Referenca je obavezna kada je priložen dokument narudžbe." : ""}
                            />
                        </div>
                        <div>
                            <Label>Dokument narudžbe</Label>
                            <Button type="button" size="sm" variant="outline" startIcon={<DocsIcon className="h-4 w-4" />} onClick={handlePickOrderDocument}>
                                {orderDocument ? orderDocument.name : "Odaberite dokument"}
                            </Button>
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