import { Input } from "@/components/ui/input";
import { cn } from "@/utils";
import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete";

const Autocomplete = AutocompletePrimitive.Root;
const AutocompleteList = AutocompletePrimitive.List;

function AutocompleteInput(props: AutocompletePrimitive.Input.Props) {
  return (
    <AutocompletePrimitive.Input
      data-slot="autocomplete-input"
      render={<Input />}
      {...props}
    />
  );
}

function AutocompleteContent({
  className,
  children,
  sideOffset = 8,
  ...props
}: AutocompletePrimitive.Popup.Props &
  Pick<AutocompletePrimitive.Positioner.Props, "sideOffset">) {
  return (
    <AutocompletePrimitive.Portal>
      <AutocompletePrimitive.Positioner
        sideOffset={sideOffset}
        align="start"
        className="isolate z-99999 outline-none"
      >
        <AutocompletePrimitive.Popup
          data-slot="autocomplete-content"
          className={cn(
            "max-h-52 w-(--anchor-width) origin-(--transform-origin) overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-theme-lg duration-100 outline-none data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 dark:border-gray-800 dark:bg-[#1E2635]",
            className,
          )}
          {...props}
        >
          {children}
        </AutocompletePrimitive.Popup>
      </AutocompletePrimitive.Positioner>
    </AutocompletePrimitive.Portal>
  );
}

function AutocompleteItem({ className, ...props }: AutocompletePrimitive.Item.Props) {
  return (
    <AutocompletePrimitive.Item
      data-slot="autocomplete-item"
      className={cn(
        "flex w-full cursor-pointer items-center truncate rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 outline-hidden transition-colors select-none data-highlighted:bg-gray-100 data-highlighted:text-gray-800 dark:text-gray-300 dark:data-highlighted:bg-white/5 dark:data-highlighted:text-white/90",
        className,
      )}
      {...props}
    />
  );
}

export {
  Autocomplete,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
};
