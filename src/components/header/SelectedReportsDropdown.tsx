import {useState} from "react";
import {Dropdown} from "../ui/dropdown/Dropdown";
import {DropdownItem} from "../ui/dropdown/DropdownItem";
import Button from "../ui/button/Button";
import SendReportsModal from "./SendReportsModal";
import {DocsIcon} from "../../icons";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {toggleReportItem} from "../../slices/DocumentSlice";
import {billReportTypeLabels} from "../../models/enums/BillReportType";
import {useModal} from "../../hooks/useModal";

export default function SelectedReportsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { isOpen: isSendModalOpen, openModal: openSendModal, closeModal: closeSendModal } = useModal();
  const dispatch = useAppDispatch();
  const reportItems = useAppSelector((state) => state.document.reportItems);

  function handleClick() {
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
        aria-label="Odabrani dokumenti za slanje"
      >
        {reportItems.length > 0 && (
          <span className="absolute -right-1 -top-1 z-10 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-medium leading-none text-white">
            {reportItems.length}
          </span>
        )}
        <DocsIcon className="h-5 w-5 fill-current" />
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-auto max-h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Odabrani dokumenti
          </h5>
          <button
            onClick={closeDropdown}
            className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        {reportItems.length === 0 ? (
          <p className="py-6 text-center text-gray-500 text-theme-sm dark:text-gray-400">
            Nema odabranih dokumenata
          </p>
        ) : (
          <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
            {reportItems.map((item) => (
              <li key={item.id}>
                <DropdownItem
                  onClick={() => dispatch(toggleReportItem(item))}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border-b border-gray-100 px-4.5 py-3 text-start hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                >
                  <span className="block">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {item.billId}
                    </span>
                    <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                      {billReportTypeLabels[item.type]}
                    </span>
                  </span>
                  <span className="text-gray-400 text-theme-xs dark:text-gray-500">
                    Ukloni
                  </span>
                </DropdownItem>
              </li>
            ))}
          </ul>
        )}
        <Button
          size="sm"
          className="mt-3 w-full"
          disabled={reportItems.length === 0}
          onClick={() => {
            closeDropdown();
            openSendModal();
          }}
        >
          Pošalji dokumente
        </Button>
      </Dropdown>
      <SendReportsModal isOpen={isSendModalOpen} onClose={closeSendModal} />
    </div>
  );
}