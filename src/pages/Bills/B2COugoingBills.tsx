import { useEffect } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { DocsIcon } from "../../icons";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchBills } from "../../slices/B2CBillSlice";
import { toggleReportItem } from "../../slices/DocumentSlice";
import type { DocumentStatus } from "../../models/enums/DocumentStatus";
import { documentStatusLabels } from "../../models/enums/DocumentStatus";
import { BillReportType } from "../../models/enums/BillReportType";

const statusColor: Record<DocumentStatus, "success" | "warning" | "error" | "info"> = {
  NaCekanju: "warning",
  NaSlanju: "warning",
  Poslan: "info",
  Isporucen: "success",
  Odobren: "success",
  Odbijen: "error",
  PlacenUPotpunosti: "success",
  ParcijalnoPlacen: "warning",
  NeuspjesnaIsporuka: "error",
};

const dateFormatter = new Intl.DateTimeFormat("hr-HR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate)).replace(/\s/g, "").replace(/\.$/, "");
}

function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

export default function B2COugoingBills() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const bills = useAppSelector((state) => state.b2c.bills);
  const reportItems = useAppSelector((state) => state.document.reportItems);

  useEffect(() => {
    dispatch(fetchBills());
  }, [dispatch]);

  return (
    <>
      <PageMeta
        title="B2C izlazni računi | Tehnomodus administracija"
        description="Popis izlaznih B2C (F1) računa."
      />
      <PageBreadcrumb pageTitle="B2C izlazni računi" />
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Račun
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Kupac
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Datum računa
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Ukupan iznos
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Status
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Poslano
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Radnje
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {bills.map((bill) => (
                <TableRow
                  key={bill.systemId}
                  className="cursor-pointer"
                  onClick={() => navigate(`/bills/f1/${bill.systemId}`)}
                >
                  <TableCell className="py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {bill.fullBillId}
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {bill.clientName}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {bill.clientOib}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatDate(bill.billDate)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatAmount(bill.totalAmount)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Badge size="sm" color={statusColor[bill.documentStatus]}>
                      {documentStatusLabels[bill.documentStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {bill.sentCount}
                  </TableCell>
                  <TableCell className="py-3">
                    <button
                      type="button"
                      aria-label="Označi za slanje dokumenta"
                      onClick={(event) => {
                        event.stopPropagation();
                        dispatch(
                          toggleReportItem({
                            id: bill.systemId,
                            billId: bill.fullBillId,
                            type: BillReportType.F1_OUTGOING,
                          }),
                        );
                      }}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                        reportItems.some((item) => item.id === bill.systemId)
                          ? "border-brand-500 bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400"
                          : "border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                      }`}
                    >
                      <DocsIcon className="h-5 w-5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
