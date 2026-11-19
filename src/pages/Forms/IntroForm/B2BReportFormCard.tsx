import type {SubmitEvent} from "react";
import {useCallback, useState} from "react";
import {useNavigate} from "react-router";
import ComponentCard from "../../../components/common/ComponentCard.tsx";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import OptionSelect from "@/components/form/OptionSelect";
import DatePicker from "../../../components/form/date-picker.tsx";
import {Button} from "@/components/ui/button";
import {useAppDispatch, useAppSelector} from "../../../app/hooks";
import {resetBusinessEntityCheck} from "../../../slices/BusinessEntitySlice";
import {createBill, reviewBill} from "../../../slices/B2BReportBillSlice";
import type {ReportBillRequest} from "../../../models/dto/ReportBillRequest";
import type {BillReviewResponse} from "../../../models/dto/BillReviewResponse";
import {BillProfile, billProfileLabels} from "../../../models/enums/BillProfile";
import {VatCategory, vatCategoryLabels} from "../../../models/enums/VatCategory";
import {DocsIcon} from "../../../icons";
import ReviewBill from "./ReviewBill.tsx";
import BillItemsEditor from "./BillItemsEditor.tsx";
import {useBillItems} from "./useBillItems.ts";
import FormField from "@/components/form/FormField";

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
    buyerName: string;
    buyerStreet: string;
    buyerCity: string;
    buyerPostalZone: string;
    vatCategory: VatCategory | "";
}

const initialBillFormState: BillFormState = {
    billId: "",
    profile: "",
    billDate: "",
    billTime: "",
    dueDate: "",
    note: "",
    orderNumber: "",
    buyerName: "",
    buyerStreet: "",
    buyerCity: "",
    buyerPostalZone: "",
    vatCategory: "",
};

export default function B2BReportFormCard({ onCancel }: { onCancel: () => void }) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const business = useAppSelector((state) => state.businessEntity.checkResult);
    const checkedOib = useAppSelector((state) => state.businessEntity.checkedOib);
    const entity = business?.businessEntity;

    const [form, setForm] = useState<BillFormState>(initialBillFormState);
    const [errors, setErrors] = useState<Partial<Record<keyof BillFormState, boolean>>>({});
    const billItems = useBillItems();
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
        if (!form.vatCategory) newErrors.vatCategory = true;
        if (orderDocument && !form.orderNumber) newErrors.orderNumber = true;
        if (!entity) {
            if (!form.buyerName) newErrors.buyerName = true;
            if (!form.buyerStreet) newErrors.buyerStreet = true;
            if (!form.buyerCity) newErrors.buyerCity = true;
            if (!form.buyerPostalZone) newErrors.buyerPostalZone = true;
        }

        const itemsValid = billItems.validate();

        if (Object.keys(newErrors).length > 0 || !itemsValid) {
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
            buyerOib: entity ? entity.oib : (checkedOib ?? ""),
            buyerName: entity ? entity.name : form.buyerName,
            buyerStreet: entity ? entity.headquatersAddress : form.buyerStreet,
            buyerCity: entity ? entity.headquatersCity : form.buyerCity,
            buyerPostalZone: entity ? entity.headquatersZip : form.buyerPostalZone,
            vatCategory: form.vatCategory as VatCategory,
            items: billItems.toRequest(),
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
                        <FormField label="Broj računa" htmlFor="billId" error={errors.billId ? "Broj računa je obavezan." : undefined}>
                            <Input
                                type="number"
                                id="billId"
                                min="1"
                                value={form.billId}
                                onChange={(e) => setField("billId", e.target.value)}
                                aria-invalid={errors.billId || undefined}
                            />
                        </FormField>
                        <FormField label="Profil" htmlFor="profile" error={errors.profile ? "Profil je obavezan." : undefined}>
                            <OptionSelect
                                id="profile"
                                options={billProfileOptions}
                                value={form.profile}
                                placeholder="Odaberite profil"
                                invalid={errors.profile}
                                onChange={(value) => setField("profile", value as BillProfile)}
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <DatePicker
                                id="billDate"
                                label="Datum računa"
                                placeholder="Odaberite datum računa"
                                onChange={handleBillDateChange}
                                error={errors.billDate}
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
                                error={errors.billTime}
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
                                error={errors.dueDate}
                            />
                            {errors.dueDate && (
                                <p className="mt-1.5 text-xs text-error-500">Datum dospijeća je obavezan.</p>
                            )}
                        </div>
                    </div>

                    <FormField label="Napomena" htmlFor="note">
                        <Textarea
                            id="note"
                            value={form.note}
                            onChange={(e) => setField("note", e.target.value)}
                        />
                    </FormField>

                    {!entity && (
                        <>
                            <FormField label="Naziv kupca" htmlFor="buyerName" error={errors.buyerName ? "Naziv kupca je obavezan." : undefined}>
                                <Input
                                    type="text"
                                    id="buyerName"
                                    value={form.buyerName}
                                    onChange={(e) => setField("buyerName", e.target.value)}
                                    aria-invalid={errors.buyerName || undefined}
                                />
                            </FormField>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField label="Ulica kupca" htmlFor="buyerStreet" error={errors.buyerStreet ? "Ulica kupca je obavezna." : undefined}>
                                    <Input
                                        type="text"
                                        id="buyerStreet"
                                        value={form.buyerStreet}
                                        onChange={(e) => setField("buyerStreet", e.target.value)}
                                        aria-invalid={errors.buyerStreet || undefined}
                                    />
                                </FormField>
                                <FormField label="Grad kupca" htmlFor="buyerCity" error={errors.buyerCity ? "Grad kupca je obavezan." : undefined}>
                                    <Input
                                        type="text"
                                        id="buyerCity"
                                        value={form.buyerCity}
                                        onChange={(e) => setField("buyerCity", e.target.value)}
                                        aria-invalid={errors.buyerCity || undefined}
                                    />
                                </FormField>
                            </div>
                            <FormField label="Poštanski broj kupca" htmlFor="buyerPostalZone" error={errors.buyerPostalZone ? "Poštanski broj kupca je obavezan." : undefined}>
                                <Input
                                    type="text"
                                    id="buyerPostalZone"
                                    value={form.buyerPostalZone}
                                    onChange={(e) => setField("buyerPostalZone", e.target.value)}
                                    aria-invalid={errors.buyerPostalZone || undefined}
                                />
                            </FormField>
                        </>
                    )}

                    <BillItemsEditor {...billItems} />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField label="Kategorija PDV-a" htmlFor="vatCategory" error={errors.vatCategory ? "Kategorija PDV-a je obavezna." : undefined}>
                            <OptionSelect
                                id="vatCategory"
                                options={vatCategoryOptions}
                                value={form.vatCategory}
                                placeholder="Odaberite kategoriju PDV-a"
                                invalid={errors.vatCategory}
                                onChange={(value) => setField("vatCategory", value as VatCategory)}
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField label="Referenca" htmlFor="orderNumber" error={errors.orderNumber ? "Referenca je obavezna kada je priložen dokument narudžbe." : undefined}>
                            <Input
                                type="text"
                                id="orderNumber"
                                value={form.orderNumber}
                                onChange={(e) => setField("orderNumber", e.target.value)}
                                aria-invalid={errors.orderNumber || undefined}
                            />
                        </FormField>
                        <FormField label="Dokument narudžbe" htmlFor="orderDocument">
                            <Button id="orderDocument" type="button" size="lg" variant="outline" className="w-fit" onClick={handlePickOrderDocument}>
                                <DocsIcon className="size-4" />
                                {orderDocument ? orderDocument.name : "Odaberite dokument"}
                            </Button>
                        </FormField>
                    </div>

                    {submitError && (
                        <p className="text-sm text-error-500">{submitError}</p>
                    )}

                    <div className="flex items-center gap-3">
                        <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={submitting}>
                            Odustani
                        </Button>
                        <Button type="submit" size="sm" className="ml-auto" disabled={submitting}>
                            Pregledaj
                        </Button>
                    </div>
                </div>
            </form>
        </ComponentCard>
    );
}