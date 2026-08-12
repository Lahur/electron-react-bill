import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { DocsIcon } from "../../icons";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchPosTransactions, uploadPosTransactionBill } from "../../slices/PosTransactionSlice";

const dateTimeFormatter = new Intl.DateTimeFormat("hr-HR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDateTime(isoDateTime: string): string {
  return dateTimeFormatter.format(new Date(isoDateTime)).replace(/\s/g, "").replace(/\.(?=\d{2}:\d{2})/, " ");
}

function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

export default function PosTransactions() {
  const dispatch = useAppDispatch();
  const transactions = useAppSelector((state) => state.posTransaction.transactions);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPosTransactions());
  }, [dispatch]);

  const handleUploadBill = async (id: string) => {
    const picked = await window.electron.openPosTransactionBill();
    if (!picked) return;

    setUploadingId(id);
    try {
      const file = new File([picked.data], picked.name, { type: "application/pdf" });
      await dispatch(uploadPosTransactionBill({ id, file })).unwrap();
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <>
      <PageMeta
        title="POS transakcije | Tehnomodus administracija"
        description="Popis POS transakcija."
      />
      <PageBreadcrumb pageTitle="POS transakcije" />
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Opis plaćanja
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  IBAN primatelja
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Poziv na broj
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Iznos
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Datum transakcije
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Račun
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {transaction.additionalRemittanceInfo}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {transaction.receiverIban}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {transaction.reference}
                  </TableCell>
                  <TableCell className="py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {formatAmount(transaction.amount)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatDateTime(transaction.transactionDate)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {transaction.hasBill ? (
                      <Badge size="sm" color="success">
                        Učitan
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        startIcon={<DocsIcon className="h-4 w-4" />}
                        onClick={() => handleUploadBill(transaction.id)}
                        disabled={uploadingId === transaction.id}
                      >
                        {uploadingId === transaction.id ? "Učitavanje..." : "Učitaj račun"}
                      </Button>
                    )}
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