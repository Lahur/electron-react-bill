import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface OptionSelectProps<T extends string> {
  id?: string;
  options: SelectOption<T>[];
  value?: T | "";
  onChange: (value: T) => void;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
}

/** Single-value select driven by an options list, built on the shared Select primitives. */
export default function OptionSelect<T extends string>({
  id,
  options,
  value,
  onChange,
  placeholder = "Odaberite opciju",
  invalid = false,
  disabled = false,
  className,
}: OptionSelectProps<T>) {
  return (
    <Select<T>
      items={options}
      value={value ? value : null}
      onValueChange={(next) => {
        if (next !== null) onChange(next);
      }}
      disabled={disabled}
    >
      <SelectTrigger id={id} aria-invalid={invalid || undefined} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
