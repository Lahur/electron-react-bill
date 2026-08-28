import {useCallback, useState} from "react";
import {Modal} from "../ui/modal";
import Button from "../ui/button/Button";
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
      <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
        Filtriraj račune
      </h4>

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

      <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Odustani
        </Button>
        <Button variant="primary" onClick={handleApply}>
          Primijeni
        </Button>
      </div>
    </>
  );
}

export default function BillsFilterModal({isOpen, ...formProps}: BillsFilterModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={formProps.onClose} className="m-4 max-w-[500px] p-6 sm:p-8">
      <BillsFilterForm {...formProps} />
    </Modal>
  );
}
