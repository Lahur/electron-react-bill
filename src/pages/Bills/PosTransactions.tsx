import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Label from "../../components/form/Label";
import EmailAutocompleteInput from "../../components/form/input/EmailAutocompleteInput";
import Checkbox from "../../components/form/input/Checkbox";
import { DocsIcon } from "../../icons";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchPosTransactions,
  uploadPosTransactionBill,
  generateAndSendPosTransactions,
} from "../../slices/PosTransactionSlice";
import { fetchRecipients } from "../../slices/RecipientSlice";

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
  const recipientEmails = useAppSelector((state) => state.recipient.emails);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { isOpen: isSendModalOpen, openModal: openSendModal, closeModal: closeSendModal } = useModal();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPosTransactions());
  }, [dispatch]);

  useEffect(() => {
    if (isSendModalOpen) dispatch(fetchRecipients());
  }, [isSendModalOpen, dispatch]);

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

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id],
    );
  };

  const handleCloseSendModal = () => {
    setEmail("");
    setSendError(null);
    closeSendModal();
  };

  const handleSend = async () => {
    setSendError(null);
    setSending(true);
    try {
      await dispatch(generateAndSendPosTransactions({ ids: selectedIds, email })).unwrap();
      setSelectedIds([]);
      handleCloseSendModal();
    } catch {
      setSendError("Slanje izvještaja nije uspjelo. Pokušajte ponovno.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageMeta
        title="POS transakcije | Tehnomodus administracija"
        description="Popis POS transakcija."
      />
      <div className="flex items-center justify-between">
        <PageBreadcrumb pageTitle="POS transakcije" />
        <Button
          size="sm"
          disabled={selectedIds.length === 0}
          onClick={openSendModal}
        >
          {selectedIds.length > 0 ? `Pošalji izvještaj (${selectedIds.length})` : "Pošalji izvještaj"}
        </Button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  <Checkbox
                    checked={transactions.length > 0 && selectedIds.length === transactions.length}
                    onChange={(checked) =>
                      setSelectedIds(checked ? transactions.map((transaction) => transaction.id) : [])
                    }
                  />
                </TableCell>
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
                  <TableCell className="py-3">
                    <Checkbox
                      checked={selectedIds.includes(transaction.id)}
                      onChange={() => toggleSelected(transaction.id)}
                    />
                  </TableCell>
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
      <Modal isOpen={isSendModalOpen} onClose={handleCloseSendModal} className="max-w-md p-6">
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Slanje izvještaja POS transakcija
        </h4>

        <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400">
          Odabrano transakcija: {selectedIds.length}
        </p>

        <div className="mb-4">
          <Label htmlFor="pos-transactions-email">Email</Label>
          <EmailAutocompleteInput
            id="pos-transactions-email"
            placeholder="buyer@example.com"
            value={email}
            onChange={setEmail}
            suggestions={recipientEmails}
          />
        </div>

        {sendError && (
          <p className="mb-4 text-error-500 text-theme-sm">{sendError}</p>
        )}

        <div className="flex justify-end gap-3">
          <Button size="sm" variant="outline" onClick={handleCloseSendModal} disabled={sending}>
            Odustani
          </Button>
          <Button
            size="sm"
            onClick={handleSend}
            disabled={sending || selectedIds.length === 0 || !email}
          >
            {sending ? "Slanje..." : "Pošalji"}
          </Button>
        </div>
      </Modal>
    </>
  );
}