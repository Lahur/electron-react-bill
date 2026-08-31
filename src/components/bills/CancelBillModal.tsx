import {useState} from "react";
import {Modal} from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

interface CancelBillModalProps {
  isOpen: boolean;
  needsNewId: boolean;
  isCancelling: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (newId?: number) => void;
}

export default function CancelBillModal({
  isOpen,
  needsNewId,
  isCancelling,
  error,
  onClose,
  onConfirm,
}: CancelBillModalProps) {
  const [newId, setNewId] = useState("");

  const parsedNewId = Number(newId);
  const newIdValid = newId.trim() !== "" && Number.isFinite(parsedNewId) && parsedNewId > 0;

  function handleConfirm() {
    if (needsNewId) {
      if (!newIdValid) return;
      onConfirm(parsedNewId);
    } else {
      onConfirm();
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
        Storniraj račun
      </h4>

      <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400">
        Jeste li sigurni da želite stornirati ovaj račun?
      </p>

      {needsNewId && (
        <div className="mb-4">
          <Label htmlFor="cancel-new-id">Broj storno dokumenta</Label>
          <Input
            id="cancel-new-id"
            type="number"
            min="1"
            placeholder="npr. 42"
            value={newId}
            onChange={(event) => setNewId(event.target.value)}
          />
        </div>
      )}

      {error && <p className="mb-4 text-error-500 text-theme-sm">{error}</p>}

      <div className="flex justify-end gap-3">
        <Button size="sm" variant="outline" onClick={onClose} disabled={isCancelling}>
          Odustani
        </Button>
        <Button
          size="sm"
          onClick={handleConfirm}
          disabled={isCancelling || (needsNewId && !newIdValid)}
          className="!bg-error-500 hover:!bg-error-600 disabled:!bg-error-300"
        >
          {isCancelling ? "Storniranje..." : "Storniraj"}
        </Button>
      </div>
    </Modal>
  );
}
