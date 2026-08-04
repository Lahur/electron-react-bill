import { useEffect } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import type { Hook, DateOption } from "flatpickr/dist/types/options";
import Label from "./Label";
import { CalenderIcon, TimeIcon } from "../../icons";

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range";
  enableTime?: boolean;
  noCalendar?: boolean;
  dateFormat?: string;
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
};

export default function DatePicker({
  id,
  mode,
  enableTime = false,
  noCalendar = false,
  dateFormat,
  onChange,
  label,
  defaultDate,
  placeholder,
}: PropsType) {
  useEffect(() => {
    const flatPickr = flatpickr(`#${id}`, {
      mode: mode || "single",
      monthSelectorType: "static",
      dateFormat: dateFormat ?? (noCalendar ? "H:i" : "d.m.Y."),
      enableTime,
      noCalendar,
      time_24hr: true,
      defaultDate,
      onChange,
    });

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [mode, enableTime, noCalendar, dateFormat, onChange, id, defaultDate]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          {noCalendar ? <TimeIcon className="size-6" /> : <CalenderIcon className="size-6" />}
        </span>
      </div>
    </div>
  );
}
