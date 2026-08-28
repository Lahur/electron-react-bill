import {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import BillsFilterToolbar from "../../components/bills/BillsFilterToolbar";
import {Table, TableBody, TableCell, TableHeader, TableRow} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import {Modal} from "../../components/ui/modal";
import {useModal} from "../../hooks/useModal";
import {BarcodeIcon, CheckCircleIcon, DocsIcon} from "../../icons";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {fetchBills, fetchBillsFilter, markAsPaid} from "../../slices/IngoingBillSlice";
import {toggleReportItem} from "../../slices/DocumentSlice";
import IngoingBillService from "../../services/IngoingBillService";
import type {DocumentStatus} from "../../models/enums/DocumentStatus";
import {DocumentStatus as DocumentStatusEnum, documentStatusLabels} from "../../models/enums/DocumentStatus";
import {BillReportType} from "../../models/enums/BillReportType";

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

export default function IngoingBills() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const bills = useAppSelector((state) => state.ingoing.bills);
  const reportItems = useAppSelector((state) => state.document.reportItems);
  const { isOpen, openModal, closeModal } = useModal();
  const [barcodeImage, setBarcodeImage] = useState<string | null>(null);
  const { isOpen: isConfirmOpen, openModal: openConfirmModal, closeModal: closeConfirmModal } = useModal();
  const [billToMarkAsPaid, setBillToMarkAsPaid] = useState<{ systemId: number; fullBillId: string } | null>(null);

  useEffect(() => {
    dispatch(fetchBills());
  }, [dispatch]);

  const showBarcode = async (id: number) => {
    const image = await IngoingBillService.generatePdf417(id);
    setBarcodeImage(image);
    openModal();
  };

  const confirmMarkAsPaid = (bill: { systemId: number; fullBillId: string }) => {
    setBillToMarkAsPaid(bill);
    openConfirmModal();
  };

  const handleMarkAsPaid = () => {
    if (billToMarkAsPaid) {
      dispatch(markAsPaid(billToMarkAsPaid.systemId));
    }
    closeConfirmModal();
    setBillToMarkAsPaid(null);
  };

  return (
    <>
      <PageMeta
        title="Ulazni računi | Tehnomodus administracija"
        description="Popis ulaznih računa."
      />
      <PageBreadcrumb pageTitle="Ulazni računi" />
      <div className="flex flex-col gap-5">
        <BillsFilterToolbar
          onApply={(params) => dispatch(fetchBillsFilter(params))}
          onReset={() => dispatch(fetchBills())}
        />

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Račun
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Dobavljač
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
                  onClick={() => navigate(`/bills/ingoing/${bill.systemId}`)}
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
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Označi za slanje dokumenta"
                        onClick={(event) => {
                          event.stopPropagation();
                          dispatch(
                            toggleReportItem({
                              id: bill.systemId,
                              billId: bill.fullBillId,
                              type: BillReportType.INGOING,
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
                      <button
                        type="button"
                        aria-label="Prikaži PDF417 barkod"
                        onClick={(event) => {
                          event.stopPropagation();
                          showBarcode(bill.systemId);
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                      >
                        <BarcodeIcon className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Označi kao plaćeno"
                        title="Označi kao plaćeno"
                        disabled={bill.documentStatus === DocumentStatusEnum.PlacenUPotpunosti}
                        onClick={(event) => {
                          event.stopPropagation();
                          confirmMarkAsPaid(bill);
                        }}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                          bill.documentStatus === DocumentStatusEnum.PlacenUPotpunosti
                            ? "cursor-not-allowed border-gray-200 text-success-500 dark:border-gray-800"
                            : "border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                        }`}
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            PDF417 barkod
          </h4>
          <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            {barcodeImage ? (
              <img
                src={`data:image/png;base64,${barcodeImage}`}
                alt="PDF417 barkod"
              />
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Barkod nije dostupan.
              </p>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <Button size="sm" variant="outline" onClick={closeModal}>
              Zatvori
            </Button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isConfirmOpen} onClose={closeConfirmModal} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Potvrda
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Označiti dokument {billToMarkAsPaid?.fullBillId} kao plaćen?
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button size="sm" variant="outline" onClick={closeConfirmModal}>
              Odustani
            </Button>
            <Button size="sm" onClick={handleMarkAsPaid}>
              Potvrdi
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}