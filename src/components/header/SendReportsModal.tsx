import {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Field, FieldDescription, FieldLabel} from "@/components/ui/field";
import EmailAutocompleteInput from "../form/input/EmailAutocompleteInput";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {generateAndSendDocuments, MAX_SEPARATED_FILES} from "../../slices/DocumentSlice";
import {fetchRecipients} from "../../slices/RecipientSlice";
import {billReportTypeLabels} from "../../models/enums/BillReportType";

interface SendReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SendReportsModal({ isOpen, onClose }: SendReportsModalProps) {
  const dispatch = useAppDispatch();
  const reportItems = useAppSelector((state) => state.document.reportItems);
  const recipientEmails = useAppSelector((state) => state.recipient.emails);
  const [email, setEmail] = useState("");
  const [separated, setSeparated] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const tooManyForSeparate = reportItems.length > MAX_SEPARATED_FILES;
  // The backend rejects individual sends above the cap, so fall back to merged.
  const effectiveSeparated = separated && !tooManyForSeparate;

  useEffect(() => {
    if (isOpen) dispatch(fetchRecipients());
  }, [isOpen, dispatch]);

  async function handleSend() {
    setSendError(null);
    setSending(true);
    try {
      await dispatch(
        generateAndSendDocuments({ email, separated: effectiveSeparated }),
      ).unwrap();
      setEmail("");
      setSeparated(false);
      onClose();
    } catch {
      setSendError("Slanje dokumenata nije uspjelo. Pokušajte ponovno.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Slanje dokumenata</DialogTitle>
      </DialogHeader>

      {reportItems.length === 0 ? (
        <DialogDescription>Nema odabranih dokumenata</DialogDescription>
      ) : (
        <ul className="flex max-h-60 flex-col overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-800">
          {reportItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 last:border-b-0 dark:border-gray-800"
            >
              <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                {item.billId}
              </span>
              <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                {billReportTypeLabels[item.type]}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Field className="gap-1.5">
        <FieldLabel htmlFor="reports-email">Email</FieldLabel>
        <EmailAutocompleteInput
          id="reports-email"
          placeholder="buyer@example.com"
          value={email}
          onChange={setEmail}
          suggestions={recipientEmails}
        />
      </Field>

      <div>
        <Field orientation="horizontal" data-disabled={reportItems.length === 0 || tooManyForSeparate || undefined}>
          <Checkbox
            id="reports-separated"
            checked={effectiveSeparated}
            onCheckedChange={setSeparated}
            disabled={reportItems.length === 0 || tooManyForSeparate}
          />
          <FieldLabel htmlFor="reports-separated">Odvojeno</FieldLabel>
        </Field>
        {tooManyForSeparate && (
          <FieldDescription className="mt-1.5 text-theme-xs">
            Zasebno slanje moguće je za najviše {MAX_SEPARATED_FILES} dokumenata.
          </FieldDescription>
        )}
      </div>

      {sendError && (
        <p className="text-theme-sm text-error-500">{sendError}</p>
      )}

      <DialogFooter>
        <Button size="sm" variant="outline" onClick={onClose} disabled={sending}>
          Odustani
        </Button>
        <Button
          size="sm"
          onClick={handleSend}
          disabled={sending || reportItems.length === 0 || !email}
        >
          {sending ? "Slanje..." : "Pošalji"}
        </Button>
      </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}