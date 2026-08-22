import { useMemo, useState } from "react";
import Input from "./InputField";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";

interface EmailAutocompleteInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
}

export default function EmailAutocompleteInput({
  id,
  value,
  onChange,
  suggestions,
  placeholder,
}: EmailAutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  const matches = useMemo(() => {
    const query = value.trim().toLowerCase();
    const filtered = query
      ? suggestions.filter(
          (email) => email.toLowerCase().includes(query) && email.toLowerCase() !== query,
        )
      : suggestions;
    return filtered.slice(0, 6);
  }, [value, suggestions]);

  return (
    <div className="relative">
      <Input
        type="email"
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="dropdown-toggle"
      />
      <Dropdown
        isOpen={isOpen && matches.length > 0}
        onClose={() => setIsOpen(false)}
        className="left-0 right-0 max-h-52 w-full overflow-y-auto"
      >
        {matches.map((email) => (
          <DropdownItem
            key={email}
            onItemClick={() => {
              onChange(email);
              setIsOpen(false);
            }}
            className="block w-full truncate px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white/90"
          >
            {email}
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
}
