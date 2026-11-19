import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Popover, PopoverClose, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {DocsIcon, XIcon} from "@/icons";
import SendReportsModal from "./SendReportsModal";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {toggleReportItem} from "../../slices/DocumentSlice";
import {billReportTypeLabels} from "../../models/enums/BillReportType";
import {useModal} from "../../hooks/useModal";

export default function SelectedReportsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { isOpen: isSendModalOpen, openModal: openSendModal, closeModal: closeSendModal } = useModal();
  const dispatch = useAppDispatch();
  const reportItems = useAppSelector((state) => state.document.reportItems);

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          aria-label="Odabrani dokumenti za slanje"
        >
          {reportItems.length > 0 && (
            <span className="absolute -top-1 -right-1 z-10 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] leading-none font-medium text-white">
              {reportItems.length}
            </span>
          )}
          <DocsIcon className="h-5 w-5 fill-current" />
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={17}
          className="flex max-h-120 w-87.5 flex-col p-3 sm:w-90.25"
        >
          <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Odabrani dokumenti
            </h5>
            <PopoverClose
              className="text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Zatvori"
            >
              <XIcon className="size-5" />
            </PopoverClose>
          </div>

          {reportItems.length === 0 ? (
            <p className="py-6 text-center text-theme-sm text-gray-500 dark:text-gray-400">
              Nema odabranih dokumenata
            </p>
          ) : (
            <ul className="custom-scrollbar flex h-auto flex-col overflow-y-auto">
              {reportItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => dispatch(toggleReportItem(item))}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border-b border-gray-100 px-4.5 py-3 text-start hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                  >
                    <span className="block">
                      <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                        {item.billId}
                      </span>
                      <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                        {billReportTypeLabels[item.type]}
                      </span>
                    </span>
                    <span className="text-theme-xs text-gray-400 dark:text-gray-500">Ukloni</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Button
            size="sm"
            className="mt-3 w-full"
            disabled={reportItems.length === 0}
            onClick={() => {
              setIsOpen(false);
              openSendModal();
            }}
          >
            Pošalji dokumente
          </Button>
        </PopoverContent>
      </Popover>
      <SendReportsModal isOpen={isSendModalOpen} onClose={closeSendModal} />
    </>
  );
}
