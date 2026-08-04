import { useEffect } from "react";
import { useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { getBillInfo } from "../../slices/BillInfoSlice";
import type { BillInfoType } from "../../slices/BillInfoSlice";
import { billDocumentKindLabels } from "../../models/enums/BillDocumentKind";
import { unitOfMeasureLabels } from "../../models/enums/UnitOfMeasure";
import { billVatRateLabels } from "../../models/enums/BillVatRate";
import { billPaymentMethodLabels } from "../../models/enums/BillPaymentMethod";
import { f1FiscalStatusLabels } from "../../models/enums/F1FiscalStatus";

const dateFormatter = new Intl.DateTimeFormat("hr-HR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(isoDate?: string | null): string | null {
  if (!isoDate) {
    return null;
  }
  return dateFormatter.format(new Date(isoDate)).replace(/\s/g, "").replace(/\.$/, "");
}

function formatAmount(amount?: number | null): string | null {
  if (amount == null) {
    return null;
  }
  return amount.toFixed(2);
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-theme-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
        {value ?? "-"}
      </p>
    </div>
  );
}

export default function BillInfo() {
  const { billType, id } = useParams<{ billType: BillInfoType; id: string }>();
  const dispatch = useAppDispatch();
  const billInfo = useAppSelector((state) => state.billInfo.billInfo);

  useEffect(() => {
    if (billType && id) {
      dispatch(getBillInfo({ billType, id }));
    }
  }, [dispatch, billType, id]);

  if (!billInfo) {
    return null;
  }

  const { mainDataInfo, buyerInfo, supplierInfo, itemInfos, paymentInfo, fiscalInfo, priceInfo } = billInfo;

  return (
    <>
      <PageMeta
        title="Podaci o računu | Tehnomodus administracija"
        description="Detalji računa."
      />
      <PageBreadcrumb pageTitle="Podaci o računu" />
      <div className="space-y-6">
        <ComponentCard title="Osnovni podaci">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <Field label="Vrsta dokumenta" value={billDocumentKindLabels[mainDataInfo.documentKind]} />
            <Field label="Valuta" value={mainDataInfo.currency} />
            <Field label="Datum računa" value={formatDate(mainDataInfo.billDate ?? mainDataInfo.issueDateTime)} />
            <Field label="Datum dospijeća" value={formatDate(mainDataInfo.dueDate)} />
            <Field label="Razdoblje računa od" value={formatDate(mainDataInfo.billPeriodFrom)} />
            <Field label="Razdoblje računa do" value={formatDate(mainDataInfo.billPeriodTill)} />
            <Field
              label="Način plaćanja"
              value={mainDataInfo.paymentMethod ? billPaymentMethodLabels[mainDataInfo.paymentMethod] : null}
            />
            <Field
              label="Fiskalni status"
              value={mainDataInfo.fiscalStatus ? f1FiscalStatusLabels[mainDataInfo.fiscalStatus] : null}
            />
          </div>
        </ComponentCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ComponentCard title="Kupac">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Naziv" value={buyerInfo.name} />
              <Field label="OIB" value={buyerInfo.oib} />
              <Field label="Adresa" value={buyerInfo.address} />
              <Field label="Grad" value={buyerInfo.city} />
              <Field label="Poštanski broj" value={buyerInfo.postalCode} />
            </div>
          </ComponentCard>

          <ComponentCard title="Dobavljač">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Naziv" value={supplierInfo.name} />
              <Field label="OIB" value={supplierInfo.oib} />
              <Field label="Adresa" value={supplierInfo.address} />
              <Field label="Grad" value={supplierInfo.city} />
              <Field label="Poštanski broj" value={supplierInfo.postalCode} />
              <Field label="Ime kontakta" value={supplierInfo.contactName} />
              <Field label="OIB kontakta" value={supplierInfo.contactOib} />
              <Field label="Email kontakta" value={supplierInfo.contactEmail} />
              <Field label="Telefon kontakta" value={supplierInfo.contactPhone} />
            </div>
          </ComponentCard>
        </div>

        <ComponentCard title="Stavke">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Naziv
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Količina
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Jedinica
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Osnovica
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Ukupan iznos
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Stopa PDV-a
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {itemInfos.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="py-3">
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {item.name}
                        </p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                          {item.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {unitOfMeasureLabels[item.unitOfMeasure]}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {formatAmount(item.baseAmount)}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {formatAmount(item.totalAmount)}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {billVatRateLabels[item.vatRate]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {paymentInfo && (
            <ComponentCard title="Plaćanje">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Način plaćanja" value={billPaymentMethodLabels[paymentInfo.paymentMethod]} />
                <Field label="Datum dospijeća" value={formatDate(paymentInfo.dueDate)} />
                <Field label="IBAN" value={paymentInfo.iban} />
                <Field label="Model" value={paymentInfo.model} />
                <Field label="Poziv na broj" value={paymentInfo.reference} />
                <Field label="Napomena" value={paymentInfo.note} />
              </div>
            </ComponentCard>
          )}

          {fiscalInfo && (
            <ComponentCard title="Fiskalizacija">
              <div className="grid grid-cols-2 gap-4">
                <Field label="ZKI" value={fiscalInfo.zki} />
                <Field label="JIR" value={fiscalInfo.jir} />
                <Field label="Vrijeme fiskalizacije" value={formatDate(fiscalInfo.fiscalizedAt)} />
              </div>
            </ComponentCard>
          )}

          <ComponentCard title="Iznosi">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Iznos bez PDV-a" value={formatAmount(priceInfo.vatExclusiveAmount)} />
              <Field label="Iznos PDV-a" value={formatAmount(priceInfo.vatAmount)} />
              <Field label="Iznos s PDV-om" value={formatAmount(priceInfo.vatInclusiveAmount)} />
              <Field label="Iznos predujma" value={formatAmount(priceInfo.advanceAmount)} />
              <Field label="Ukupan iznos" value={formatAmount(priceInfo.totalAmount)} />
            </div>
          </ComponentCard>
        </div>
      </div>
    </>
  );
}