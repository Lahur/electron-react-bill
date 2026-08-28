import ComponentCard from "../../../components/common/ComponentCard.tsx";
import Button from "../../../components/ui/button/Button.tsx";
import type {BillReviewResponse} from "../../../models/dto/BillReviewResponse.ts";
import {billProfileLabels} from "../../../models/enums/BillProfile";
import {vatCategoryLabels} from "../../../models/enums/VatCategory";

function Field({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div>
            <p className="mb-1 text-xs leading-normal text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{value ?? "-"}</p>
        </div>
    );
}

function Section({
    title,
    divider = true,
    children,
}: {
    title: string;
    divider?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className={divider ? "border-t border-gray-100 pt-6 dark:border-gray-800" : ""}>
            <h4 className="mb-4 text-sm font-semibold text-gray-800 dark:text-white/90">{title}</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
        </div>
    );
}

function formatAmount(amount: number): string {
    return amount.toFixed(2);
}

function formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return isoDate;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}.`;
}

function formatTime(time: string): string {
    const [hours = "00", minutes = "00"] = time.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

export default function ReviewBill({
    billReview,
    onConfirm,
    onBack,
    submitting,
    submitError,
}: {
    billReview: BillReviewResponse;
    onConfirm: () => void;
    onBack: () => void;
    submitting: boolean;
    submitError: string | null;
}) {
    return (
        <ComponentCard title="Review Bill">
            <Section title="Bill Details" divider={false}>
                <Field label="Bill Number" value={billReview.billNumber} />
                <Field label="Profile" value={billProfileLabels[billReview.profile]} />
                <Field label="Bill Date" value={formatDate(billReview.billDate)} />
                <Field label="Bill Time" value={formatTime(billReview.billTime)} />
                <Field label="Due Date" value={formatDate(billReview.dueDate)} />
                <Field label="Reference" value={billReview.orderNumber} />
            </Section>

            <Section title="Buyer">
                <Field label="Buyer OIB" value={billReview.buyerOib} />
                <Field label="Buyer Name" value={billReview.buyerName} />
                <Field label="Buyer Address" value={billReview.buyerAddress} />
                <Field label="Buyer City" value={billReview.buyerCity} />
                <Field label="Buyer Postal Code" value={billReview.buyerPostalZone} />
            </Section>

            <Section title="Item">
                <Field label="Item Name" value={billReview.name} />
                <Field label="Item Description" value={billReview.description} />
                {billReview.note && <Field label="Note" value={billReview.note} />}
            </Section>

            <Section title="Amounts">
                <Field label="Base Amount" value={formatAmount(billReview.baseAmount)} />
                <Field label="VAT Category" value={vatCategoryLabels[billReview.pdvType]} />
                <Field label="Tax Amount" value={formatAmount(billReview.taxAmount)} />
                <Field label="Total Amount" value={formatAmount(billReview.totalAmount)} />
            </Section>

            {submitError && (
                <p className="text-sm text-error-500">{submitError}</p>
            )}

            <div className="flex items-center gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
                <Button type="button" size="sm" variant="outline" onClick={onBack} disabled={submitting}>
                    Back
                </Button>
                <Button type="button" size="sm" variant="primary" className="ml-auto" onClick={onConfirm} disabled={submitting}>
                    Confirm
                </Button>
            </div>
        </ComponentCard>
    );
}
