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
        <ComponentCard title="Pregled računa">
            <Section title="Podaci o računu" divider={false}>
                <Field label="Broj računa" value={billReview.billNumber} />
                <Field label="Profil" value={billProfileLabels[billReview.profile]} />
                <Field label="Datum računa" value={formatDate(billReview.billDate)} />
                <Field label="Vrijeme računa" value={formatTime(billReview.billTime)} />
                <Field label="Datum dospijeća" value={formatDate(billReview.dueDate)} />
                <Field label="Referenca" value={billReview.orderNumber} />
            </Section>

            <Section title="Kupac">
                <Field label="OIB kupca" value={billReview.buyerOib} />
                <Field label="Naziv kupca" value={billReview.buyerName} />
                <Field label="Adresa kupca" value={billReview.buyerAddress} />
                <Field label="Grad kupca" value={billReview.buyerCity} />
                <Field label="Poštanski broj kupca" value={billReview.buyerPostalZone} />
            </Section>

            <Section title="Stavka">
                <Field label="Naziv stavke" value={billReview.name} />
                <Field label="Opis stavke" value={billReview.description} />
                {billReview.note && <Field label="Napomena" value={billReview.note} />}
            </Section>

            <Section title="Iznosi">
                <Field label="Osnovica" value={formatAmount(billReview.baseAmount)} />
                <Field label="Kategorija PDV-a" value={vatCategoryLabels[billReview.pdvType]} />
                <Field label="Iznos PDV-a" value={formatAmount(billReview.taxAmount)} />
                <Field label="Ukupan iznos" value={formatAmount(billReview.totalAmount)} />
            </Section>

            {submitError && (
                <p className="text-sm text-error-500">{submitError}</p>
            )}

            <div className="flex items-center gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
                <Button type="button" size="sm" variant="outline" onClick={onBack} disabled={submitting}>
                    Natrag
                </Button>
                <Button type="button" size="sm" variant="primary" className="ml-auto" onClick={onConfirm} disabled={submitting}>
                    Potvrdi
                </Button>
            </div>
        </ComponentCard>
    );
}
