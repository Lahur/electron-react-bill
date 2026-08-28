import {useState} from "react";
import Button from "../ui/button/Button";
import BillsFilterModal from "./BillsFilterModal";
import {useModal} from "../../hooks/useModal";
import type {BillSearchParams} from "../../models/dto/BillSearchParams";

interface BillsFilterToolbarProps {
  onApply: (params: BillSearchParams) => void;
  onReset: () => void;
}

function FilterIcon({className}: {className?: string}) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 6h16M7 12h10m-6 6h2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RefreshIcon({className}: {className?: string}) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 12a8 8 0 1 1-2.343-5.657M20 4v4h-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function BillsFilterToolbar({onApply, onReset}: BillsFilterToolbarProps) {
  const {isOpen, openModal, closeModal} = useModal();
  const [filter, setFilter] = useState<BillSearchParams>({});

  const hasActiveFilter = Boolean(filter.dateFrom || filter.dateTill);

  function handleApply(params: BillSearchParams) {
    setFilter(params);
    if (params.dateFrom || params.dateTill) {
      onApply(params);
    } else {
      onReset();
    }
  }

  function handleReset() {
    setFilter({});
    onReset();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {hasActiveFilter ? (
          <Button
            variant="outline"
            startIcon={<FilterIcon className="h-5 w-5" />}
            onClick={handleReset}
          >
            Očisti filter
          </Button>
        ) : (
          <Button
            variant="primary"
            startIcon={<FilterIcon className="h-5 w-5" />}
            onClick={openModal}
          >
            Filtriraj
          </Button>
        )}

        <button
          type="button"
          aria-label="Osvježi i očisti filter"
          title="Osvježi i očisti filter"
          onClick={handleReset}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <RefreshIcon className="h-5 w-5" />
        </button>
      </div>

      <BillsFilterModal
        isOpen={isOpen}
        onClose={closeModal}
        onApply={handleApply}
        initial={filter}
      />
    </div>
  );
}
