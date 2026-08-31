import {useEffect, useState} from "react";
import {Modal} from "../ui/modal";
import Label from "../form/Label";
import Checkbox from "../form/input/Checkbox";
import EmailAutocompleteInput from "../form/input/EmailAutocompleteInput";
import Button from "../ui/button/Button";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {fetchRecipients} from "../../slices/RecipientSlice";

interface BankStatementImportModalProps {
  isOpen: boolean;
  fileCount: number;
  isImporting: boolean;
  onClose: () => void;
  onConfirm: (email?: string) => void;
}

export default function BankStatementImportModal({
  isOpen,
  fileCount,
  isImporting,
  onClose,
  onConfirm,
}: BankStatementImportModalProps) {
  const dispatch = useAppDispatch();
  const recipientEmails = useAppSelector((state) => state.recipient.emails);
  const [sendStatements, setSendStatements] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    dispatch(fetchRecipients());
  }, [dispatch]);

  function handleConfirm() {
    onConfirm(sendStatements && email ? email : undefined);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
        Uvoz bankovnih izvoda
      </h4>

      <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400">
        {fileCount === 1
          ? "Odabrana je 1 datoteka."
          : `Odabrano je ${fileCount} datoteka.`}
      </p>

      <div className="mb-4">
        <Checkbox
          id="send-statements"
          label="Pošalji izvode e-poštom"
          checked={sendStatements}
          onChange={setSendStatements}
          disabled={isImporting}
        />
      </div>

      {sendStatements && (
        <div className="mb-4">
          <Label htmlFor="statements-email">Email</Label>
          <EmailAutocompleteInput
            id="statements-email"
            placeholder="buyer@example.com"
            value={email}
            onChange={setEmail}
            suggestions={recipientEmails}
          />
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button size="sm" variant="outline" onClick={onClose} disabled={isImporting}>
          Odustani
        </Button>
        <Button
          size="sm"
          onClick={handleConfirm}
          disabled={isImporting || (sendStatements && !email)}
        >
          {isImporting ? "Uvoz u tijeku..." : "Uvezi"}
        </Button>
      </div>
    </Modal>
  );
}
