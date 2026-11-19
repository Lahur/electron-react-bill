import {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Field, FieldLabel} from "@/components/ui/field";
import EmailAutocompleteInput from "../form/input/EmailAutocompleteInput";
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Uvoz bankovnih izvoda</DialogTitle>
        <DialogDescription>
          {fileCount === 1
            ? "Odabrana je 1 datoteka."
            : `Odabrano je ${fileCount} datoteka.`}
        </DialogDescription>
      </DialogHeader>

      <Field orientation="horizontal" data-disabled={isImporting || undefined}>
        <Checkbox
          id="send-statements"
          checked={sendStatements}
          onCheckedChange={setSendStatements}
          disabled={isImporting}
        />
        <FieldLabel htmlFor="send-statements">Pošalji izvode e-poštom</FieldLabel>
      </Field>

      {sendStatements && (
        <Field className="gap-1.5">
          <FieldLabel htmlFor="statements-email">Email</FieldLabel>
          <EmailAutocompleteInput
            id="statements-email"
            placeholder="buyer@example.com"
            value={email}
            onChange={setEmail}
            suggestions={recipientEmails}
          />
        </Field>
      )}

      <DialogFooter>
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
      </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
