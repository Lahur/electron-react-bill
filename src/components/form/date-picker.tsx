import {useEffect, useRef} from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import {Croatian} from "flatpickr/dist/l10n/hr.js";
import type {DateOption, Hook} from "flatpickr/dist/types/options";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {CalendarIcon, TimeIcon} from "@/icons";

flatpickr.localize(Croatian);

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
  error?: boolean;
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
  error = false,
}: PropsType) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;
    const instance = flatpickr(inputRef.current, {
      mode: mode || "single",
      monthSelectorType: "static",
      dateFormat: dateFormat ?? (noCalendar ? "H:i" : "d.m.Y."),
      enableTime,
      noCalendar,
      time_24hr: true,
      defaultDate,
      onChange,
    });

    return () => instance.destroy();
  }, [mode, enableTime, noCalendar, dateFormat, onChange, defaultDate]);

  return (
    <Field data-invalid={error || undefined} className="gap-1.5">
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          type="text"
          placeholder={placeholder}
          aria-invalid={error || undefined}
          className="pe-10"
        />
        <span className="pointer-events-none absolute inset-e-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          {noCalendar ? <TimeIcon className="size-5" /> : <CalendarIcon className="size-5" />}
        </span>
      </div>
    </Field>
  );
}
