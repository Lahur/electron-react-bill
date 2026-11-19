import {useCallback, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import DatePicker from "../form/date-picker.tsx";
import type {BillSearchParams} from "../../models/dto/BillSearchParams";

interface BillsFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (params: BillSearchParams) => void;
  initial?: BillSearchParams;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function BillsFilterForm({onClose, onApply, initial}: Omit<BillsFilterModalProps, "isOpen">) {
  const [dateFrom, setDateFrom] = useState(initial?.dateFrom ?? "");
  const [dateTill, setDateTill] = useState(initial?.dateTill ?? "");

  const handleDateFromChange = useCallback((dates: Date[]) => {
    setDateFrom(dates[0] ? toIsoDate(dates[0]) : "");
  }, []);

  const handleDateTillChange = useCallback((dates: Date[]) => {
    setDateTill(dates[0] ? toIsoDate(dates[0]) : "");
  }, []);

  function handleApply() {
    onApply({
      dateFrom: dateFrom || undefined,
      dateTill: dateTill || undefined,
    });
    onClose();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Filtriraj račune</DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DatePicker
          id="filter-date-from"
          label="Datum od"
          placeholder="Odaberite datum"
          defaultDate={initial?.dateFrom}
          onChange={handleDateFromChange}
        />
        <DatePicker
          id="filter-date-till"
          label="Datum do"
          placeholder="Odaberite datum"
          defaultDate={initial?.dateTill}
          onChange={handleDateTillChange}
        />
      </div>

      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onClose}>
          Odustani
        </Button>
        <Button onClick={handleApply}>
          Primijeni
        </Button>
      </DialogFooter>
    </>
  );
}

export default function BillsFilterModal({isOpen, ...formProps}: BillsFilterModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && formProps.onClose()}>
      <DialogContent className="sm:max-w-125 sm:p-8">
        <BillsFilterForm {...formProps} />
      </DialogContent>
    </Dialog>
  );
}
