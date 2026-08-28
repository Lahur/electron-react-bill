import { useCallback, useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import DatePicker from "../../components/form/date-picker";
import Checkbox from "../../components/form/input/Checkbox";
import { DocsIcon } from "../../icons";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchAccountsStatements, createAccountsStatement, uploadAccountsStatementBill, syncAccountsStatements } from "../../slices/AccountsStatementSlice";
import { toggleReportItem } from "../../slices/DocumentSlice";
import { BillReportType } from "../../models/enums/BillReportType";

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

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface AccountsStatementFormState {
  amount: string;
  description: string;
  date: string;
}

const initialFormState: AccountsStatementFormState = {
  amount: "",
  description: "",
  date: "",
};

function CreateAccountsStatementForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: () => void }) {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<AccountsStatementFormState>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof AccountsStatementFormState, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bill, setBill] = useState<File | null>(null);

  const setField = useCallback(<K extends keyof AccountsStatementFormState>(field: K, value: AccountsStatementFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handlePickBill = useCallback(async () => {
    const picked = await window.electron.openAccountsStatementBill();
    if (!picked) return;
    setBill(new File([picked.data], picked.name, { type: "application/pdf" }));
  }, []);

  const handleDateChange = useCallback((dates: Date[]) => {
    if (dates[0]) setField("date", toIsoDate(dates[0]));
  }, [setField]);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: Partial<Record<keyof AccountsStatementFormState, boolean>> = {};
    if (form.amount === "" || Number(form.amount) < 0) newErrors.amount = true;
    if (!form.description) newErrors.description = true;
    if (!form.date) newErrors.date = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setSubmitting(true);

    try {
      await dispatch(
        createAccountsStatement({
          request: {
            amount: Number(form.amount),
            description: form.description,
            date: form.date,
          },
          file: bill,
        }),
      ).unwrap();
      onCreated();
    } catch {
      setSubmitError("Izrada izvoda nije uspjela. Pokušajte ponovno.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ComponentCard title="Novi blagajnički izvještaj">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="amount">Iznos</Label>
              <Input
                type="number"
                id="amount"
                min="0"
                step={0.01}
                value={form.amount}
                onChange={(e) => setField("amount", e.target.value)}
                error={errors.amount}
                hint={errors.amount ? "Iznos mora biti 0 ili veći." : ""}
              />
            </div>
            <div>
              <DatePicker
                id="date"
                label="Datum"
                placeholder="Odaberite datum izvoda"
                onChange={handleDateChange}
              />
              {errors.date && (
                <p className="mt-1.5 text-xs text-error-500">Datum je obavezan.</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Opis</Label>
            <Input
              type="text"
              id="description"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              error={errors.description}
              hint={errors.description ? "Opis je obavezan." : ""}
            />
          </div>

          <div>
            <Label>Račun</Label>
            <Button type="button" size="sm" variant="outline" startIcon={<DocsIcon className="h-4 w-4" />} onClick={handlePickBill}>
              {bill ? bill.name : "Odaberite PDF"}
            </Button>
          </div>

          {submitError && (
            <p className="text-sm text-error-500">{submitError}</p>
          )}

          <div className="flex items-center gap-3">
            <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={submitting}>
              Odustani
            </Button>
            <Button type="submit" size="sm" variant="primary" className="ml-auto" disabled={submitting}>
              {submitting ? "Spremanje..." : "Spremi"}
            </Button>
          </div>
        </div>
      </form>
    </ComponentCard>
  );
}

export default function AccountsStatements() {
  const dispatch = useAppDispatch();
  const statements = useAppSelector((state) => state.accountsStatement.statements);
  const reportItems = useAppSelector((state) => state.document.reportItems);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    dispatch(fetchAccountsStatements());
  }, [dispatch]);

  const handleUploadBill = async (id: string) => {
    const picked = await window.electron.openAccountsStatementBill();
    if (!picked) return;

    setUploadingId(id);
    try {
      const file = new File([picked.data], picked.name, { type: "application/pdf" });
      await dispatch(uploadAccountsStatementBill({ id, file })).unwrap();
    } finally {
      setUploadingId(null);
    }
  };

  const toggleSelection = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((selectedId) => selectedId !== id)));
  };

  const handleSync = async () => {
    if (selectedIds.length === 0) return;

    setSyncing(true);
    try {
      await dispatch(syncAccountsStatements(selectedIds)).unwrap();
      setSelectedIds([]);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Blagajnički izvještaji | Tehnomodus administracija"
        description="Popis blagajničkih izvještaja."
      />
      <PageBreadcrumb pageTitle="Blagajnički izvještaji" />

      {showCreateForm ? (
        <CreateAccountsStatementForm
          onCancel={() => setShowCreateForm(false)}
          onCreated={() => setShowCreateForm(false)}
        />
      ) : (
        <>
          <div className="mb-4 flex justify-end gap-3">
            <Button size="sm" variant="outline" onClick={handleSync} disabled={syncing || selectedIds.length === 0}>
              {syncing ? "Sinkronizacija..." : `Sinkroniziraj${selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}`}
            </Button>
            <Button size="sm" onClick={() => setShowCreateForm(true)}>
              Kreiraj izvještaj
            </Button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                  <TableRow>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    </TableCell>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Opis
                    </TableCell>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Iznos
                    </TableCell>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Datum
                    </TableCell>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Račun
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
                  {statements.map((statement) => (
                    <TableRow key={statement.id}>
                      <TableCell className="py-3">
                        <Checkbox
                          checked={selectedIds.includes(statement.id)}
                          onChange={(checked) => toggleSelection(statement.id, checked)}
                          disabled={!!statement.cashWithdrawalBalanceIds && statement.cashWithdrawalBalanceIds.length > 0}
                        />
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {statement.description}
                      </TableCell>
                      <TableCell className="py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {formatAmount(statement.amount)}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(statement.date)}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {statement.hasBill ? (
                          <Badge size="sm" color="success">
                            Učitan
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            startIcon={<DocsIcon className="h-4 w-4" />}
                            onClick={() => handleUploadBill(statement.id)}
                            disabled={uploadingId === statement.id}
                          >
                            {uploadingId === statement.id ? "Učitavanje..." : "Učitaj račun"}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {statement.cashWithdrawalBalanceIds && statement.cashWithdrawalBalanceIds.length > 0 ? (
                          <Badge size="sm" color="success">
                            Proveden
                          </Badge>
                        ) : (
                          <Badge size="sm" color="error">
                            Ne proveden
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {statement.sentCount}
                      </TableCell>
                      <TableCell className="py-3">
                        <button
                          type="button"
                          aria-label="Označi za slanje dokumenta"
                          onClick={() => {
                            dispatch(
                              toggleReportItem({
                                id: statement.id,
                                billId: statement.description,
                                type: BillReportType.ACCOUNTS_STATEMENT,
                              }),
                            );
                          }}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                            reportItems.some((item) => item.id === statement.id)
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
      )}
    </>
  );
}