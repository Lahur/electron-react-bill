import {useMemo} from "react";
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@/components/ui/autocomplete";

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
    <Autocomplete
      items={matches}
      filter={null}
      value={value}
      onValueChange={(next) => onChange(next)}
      openOnInputClick
    >
      <AutocompleteInput id={id} type="email" placeholder={placeholder} />
      {matches.length > 0 && (
        <AutocompleteContent>
          <AutocompleteList>
            {(email: string) => (
              <AutocompleteItem key={email} value={email}>
                {email}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      )}
    </Autocomplete>
  );
}
