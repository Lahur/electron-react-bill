import {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import {Table, TableBody, TableCell, TableHeader, TableRow} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import BankStatementImportModal from "../../components/bills/BankStatementImportModal";
import {DocsIcon} from "../../icons";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {fetchBankStatements, uploadBankStatements} from "../../slices/BankStatementSlice";
import {toggleReportItem} from "../../slices/DocumentSlice";
import {BillReportType} from "../../models/enums/BillReportType";

const dateFormatter = new Intl.DateTimeFormat("hr-HR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("hr-HR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate)).replace(/\s/g, "").replace(/\.$/, "");
}

function formatDateTime(isoDateTime: string): string {
  return dateTimeFormatter.format(new Date(isoDateTime)).replace(/\s/g, "").replace(/\.(?=\d{2}:\d{2})/, " ");
}

export default function BankStatements() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const statements = useAppSelector((state) => state.bankStatement.statements);
  const reportItems = useAppSelector((state) => state.document.reportItems);
  const [isImporting, setIsImporting] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  useEffect(() => {
    dispatch(fetchBankStatements());
  }, [dispatch]);

  const handleImport = async () => {
    const selected = await window.electron.openBankStatementFiles();
    if (selected.length === 0) return;

    setPendingFiles(selected.map(({ name, data }) => new File([data], name)));
  };

  const handleConfirmImport = async (email?: string) => {
    setIsImporting(true);
    try {
      await dispatch(uploadBankStatements({ files: pendingFiles, email })).unwrap();
      setPendingFiles([]);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Bankovni izvodi | Tehnomodus administracija"
        description="Popis uvezenih bankovnih izvoda."
      />
      <PageBreadcrumb pageTitle="Bankovni izvodi" />
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={handleImport} disabled={isImporting}>
          {isImporting ? "Uvoz u tijeku..." : "Uvezi izvod"}
        </Button>
      </div>
      {pendingFiles.length > 0 && (
        <BankStatementImportModal
          isOpen
          fileCount={pendingFiles.length}
          isImporting={isImporting}
          onClose={() => {
            if (!isImporting) setPendingFiles([]);
          }}
          onConfirm={handleConfirmImport}
        />
      )}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  ID izvoda
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  IBAN
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Valuta
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Razdoblje od
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Razdoblje do
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Kreiran
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
                <TableRow
                  key={statement.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/bills/bank-statements/${statement.id}`)}
                >
                  <TableCell className="py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {statement.statementId}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {statement.iban}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {statement.currency}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatDate(statement.periodFrom)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatDate(statement.periodTo)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatDateTime(statement.createdAt)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {statement.sentCount}
                  </TableCell>
                  <TableCell className="py-3">
                    <button
                      type="button"
                      aria-label="Označi za slanje dokumenta"
                      onClick={(event) => {
                        event.stopPropagation();
                        dispatch(
                          toggleReportItem({
                            id: statement.id,
                            billId: statement.statementId,
                            type: BillReportType.BANK_STATEMENT,
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
  );
}