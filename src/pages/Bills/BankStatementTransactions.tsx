import {useEffect} from "react";
import {useParams} from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import {Table, TableBody, TableCell, TableHeader, TableRow} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {fetchBankStatements} from "../../slices/BankStatementSlice";
import {fetchBankTransactionsByStatement} from "../../slices/BankTransactionSlice";
import {bankTransactionTypeLabels} from "../../models/enums/BankTransactionType";
import {CreditDebitIndicator} from "../../models/enums/CreditDebitIndicator";

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

export default function BankStatementTransactions() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const statements = useAppSelector((state) => state.bankStatement.statements);
  const transactions = useAppSelector((state) => state.bankTransaction.transactions);
  const statement = statements.find((s) => s.id === id);

  useEffect(() => {
    if (id) dispatch(fetchBankTransactionsByStatement(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (statements.length === 0) dispatch(fetchBankStatements());
  }, [dispatch, statements.length]);

  const pageTitle = statement ? `Bankovni izvod ${statement.statementId}` : "Bankovni izvod";

  return (
    <>
      <PageMeta
        title={`${pageTitle} | Tehnomodus administracija`}
        description="Popis transakcija bankovnog izvoda."
      />
      <PageBreadcrumb pageTitle={pageTitle} />
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Datum transakcije
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Druga strana
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Opis plaćanja
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Poziv na broj
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Vrsta
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Iznos
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Potražuje/Duguje
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Račun
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {transactions.map((transaction) => {
                const isCredit = transaction.creditDebitIndicator === CreditDebitIndicator.CRDT;
                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {formatDateTime(transaction.transactionDate)}
                    </TableCell>
                    <TableCell className="py-3">
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {transaction.counterpartyName ?? "-"}
                        </p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                          {(isCredit ? transaction.senderIban : transaction.receiverIban) ?? ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {transaction.additionalRemittanceInfo ?? "-"}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {transaction.reference ?? "-"}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {bankTransactionTypeLabels[transaction.transactionType]}
                    </TableCell>
                    <TableCell className={`py-3 font-medium text-theme-sm ${isCredit ? "text-success-600 dark:text-success-500" : "text-error-600 dark:text-error-500"}`}>
                      {formatAmount(transaction.amount)}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {transaction.creditDebitIndicator}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {transaction.billSystemId ? (
                        <Badge size="sm" color="success">Povezan</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
