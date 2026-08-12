import { useCallback, useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import DatePicker from "../../components/form/date-picker";
import { DocsIcon } from "../../icons";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchCashWithdrawalBalances, createCashWithdrawalAccountsStatement } from "../../slices/CashWithdrawalBalanceSlice";
import type { CashWithdrawalBalanceResponse } from "../../models/dto/CashWithdrawalBalanceResponse";

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

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface CreateAccountsStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  balances: CashWithdrawalBalanceResponse[];
  onRemove: (id: string) => void;
}

function CreateAccountsStatementModal({ isOpen, onClose, selectedIds, balances, onRemove }: CreateAccountsStatementModalProps) {
  const dispatch = useAppDispatch();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [bill, setBill] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedBalances = selectedIds
    .map((id) => balances.find((balance) => balance.id === id))
    .filter((balance): balance is CashWithdrawalBalanceResponse => balance !== undefined);

  const handlePickBill = useCallback(async () => {
    const picked = await window.electron.openAccountsStatementBill();
    if (!picked) return;
    setBill(new File([picked.data], picked.name, { type: "application/pdf" }));
  }, []);

  const handleDateChange = useCallback((dates: Date[]) => {
    if (dates[0]) setDate(toIsoDate(dates[0]));
  }, []);

  const handleClose = () => {
    setAmount("");
    setDescription("");
    setDate("");
    setBill(null);
    setSubmitError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!amount || !description || !date || selectedIds.length === 0) return;

    setSubmitError(null);
    setSubmitting(true);
    try {
      const cashWithdrawalIds = Object.fromEntries(selectedIds.map((id, index) => [index + 1, id]));
      await dispatch(
        createCashWithdrawalAccountsStatement({
          request: { cashWithdrawalIds, amount: Number(amount), description, date },
          file: bill,
        }),
      ).unwrap();
      handleClose();
    } catch {
      setSubmitError("Izrada izvoda nije uspjela. Pokušajte ponovno.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md p-6">
      <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
        Kreiraj izvod
      </h4>

      {selectedBalances.length === 0 ? (
        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
          Nema odabranih stanja blagajne
        </p>
      ) : (
        <ul className="mb-4 flex max-h-60 flex-col overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-800">
          {selectedBalances.map((balance, index) => (
            <li
              key={balance.id}
              className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-2.5 last:border-b-0 dark:border-gray-800"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[11px] font-medium text-white">
                  {index + 1}
                </span>
                <span>
                  <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {balance.additionalRemittanceInfo}
                  </span>
                  <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                    Stanje: {formatAmount(balance.balance)}
                  </span>
                </span>
              </span>
              <button
                type="button"
                onClick={() => onRemove(balance.id)}
                className="text-gray-400 text-theme-xs hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200"
              >
                Ukloni
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="statement-amount">Iznos</Label>
          <Input
            type="number"
            id="statement-amount"
            min="0"
            step={0.01}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <DatePicker
          id="statement-date"
          label="Datum"
          placeholder="Odaberite datum izvoda"
          onChange={handleDateChange}
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="statement-description">Opis</Label>
        <Input
          type="text"
          id="statement-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <Label>Račun</Label>
        <Button type="button" size="sm" variant="outline" startIcon={<DocsIcon className="h-4 w-4" />} onClick={handlePickBill}>
          {bill ? bill.name : "Odaberite PDF"}
        </Button>
      </div>

      {submitError && (
        <p className="mb-4 text-error-500 text-theme-sm">{submitError}</p>
      )}

      <div className="flex justify-end gap-3">
        <Button size="sm" variant="outline" onClick={handleClose} disabled={submitting}>
          Odustani
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={submitting || selectedIds.length === 0 || !amount || !description || !date}
        >
          {submitting ? "Spremanje..." : "Spremi"}
        </Button>
      </div>
    </Modal>
  );
}

export default function CashWithdrawalBalances() {
  const dispatch = useAppDispatch();
  const balances = useAppSelector((state) => state.cashWithdrawalBalance.balances);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    dispatch(fetchCashWithdrawalBalances());
  }, [dispatch]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id],
    );
  };

  return (
    <>
      <PageMeta
        title="Stanje blagajne | Tehnomodus administracija"
        description="Popis stanja blagajne po podignutim gotovinama."
      />
      <PageBreadcrumb pageTitle="Stanje blagajne" />
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={openModal} disabled={selectedIds.length === 0}>
          Kreiraj izvod {selectedIds.length > 0 && `(${selectedIds.length})`}
        </Button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Redoslijed
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Datum transakcije
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Ukupno
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Stanje
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Opis plaćanja
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {balances.map((balance) => {
                const order = selectedIds.indexOf(balance.id);
                const isSelected = order !== -1;
                return (
                  <TableRow key={balance.id}>
                    <TableCell className="py-3">
                      <button
                        type="button"
                        aria-label={isSelected ? `Odabrano, redoslijed ${order + 1}` : "Odaberi za izvod"}
                        onClick={() => toggleSelection(balance.id)}
                        className={`flex h-9 w-9 items-center justify-center rounded-full border text-theme-sm font-medium transition-colors ${
                          isSelected
                            ? "border-brand-500 bg-brand-500 text-white"
                            : "border-gray-300 text-transparent hover:border-brand-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/[0.03]"
                        }`}
                      >
                        {isSelected ? order + 1 : ""}
                      </button>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {formatDateTime(balance.transactionDate)}
                    </TableCell>
                    <TableCell className="py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {formatAmount(balance.total)}
                    </TableCell>
                    <TableCell className="py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {formatAmount(balance.balance)}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {balance.additionalRemittanceInfo}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <CreateAccountsStatementModal
        isOpen={isOpen}
        onClose={closeModal}
        selectedIds={selectedIds}
        balances={balances}
        onRemove={(id) => setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id))}
      />
    </>
  );
}