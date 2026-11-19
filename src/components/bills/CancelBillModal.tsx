import {useState} from "react";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Storniraj račun</DialogTitle>
        <DialogDescription>Jeste li sigurni da želite stornirati ovaj račun?</DialogDescription>
      </DialogHeader>

      {needsNewId && (
        <Field className="gap-1.5">
          <FieldLabel htmlFor="cancel-new-id">Broj storno dokumenta</FieldLabel>
          <Input
            id="cancel-new-id"
            type="number"
            min="1"
            placeholder="npr. 42"
            value={newId}
            onChange={(event) => setNewId(event.target.value)}
          />
        </Field>
      )}

      {error && <p className="text-theme-sm text-error-500">{error}</p>}

      <DialogFooter>
        <Button size="sm" variant="outline" onClick={onClose} disabled={isCancelling}>
          Odustani
        </Button>
        <Button
          size="sm"
          onClick={handleConfirm}
          disabled={isCancelling || (needsNewId && !newIdValid)}
          variant="destructive"
        >
          {isCancelling ? "Storniranje..." : "Storniraj"}
        </Button>
      </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
