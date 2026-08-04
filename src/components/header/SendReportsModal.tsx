import { useState } from "react";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { generateAndSendDocuments } from "../../slices/DocumentSlice";
import { billReportTypeLabels } from "../../models/enums/BillReportType";

interface SendReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SendReportsModal({ isOpen, onClose }: SendReportsModalProps) {
  const dispatch = useAppDispatch();
  const reportItems = useAppSelector((state) => state.document.reportItems);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  async function handleSend() {
    setSendError(null);
    setSending(true);
    try {
      await dispatch(generateAndSendDocuments(email)).unwrap();
      setEmail("");
      onClose();
    } catch {
      setSendError("Slanje dokumenata nije uspjelo. Pokušajte ponovno.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
        Slanje dokumenata
      </h4>

      {reportItems.length === 0 ? (
        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
          Nema odabranih dokumenata
        </p>
      ) : (
        <ul className="mb-4 flex max-h-60 flex-col overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-800">
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

      <div className="mb-4">
        <Label htmlFor="reports-email">Email</Label>
        <Input
          type="email"
          id="reports-email"
          placeholder="buyer@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      {sendError && (
        <p className="mb-4 text-error-500 text-theme-sm">{sendError}</p>
      )}

      <div className="flex justify-end gap-3">
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
      </div>
    </Modal>
  );
}