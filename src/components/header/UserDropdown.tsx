import {useAppSelector} from "../../app/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import {ChevronDownIcon} from "@/icons";

export default function UserDropdown() {
  const user = useAppSelector((state) => state.auth.user);

  async function handleLogout() {
    await window.electron.auth.logout();
    window.location.reload();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex items-center text-gray-700 outline-hidden dark:text-gray-400">
        <span className="me-3 h-11 w-11 overflow-hidden rounded-full">
          <img src={user?.picture} alt="Korisnik" />
        </span>
        <span className="me-1 block text-theme-sm font-medium">{user?.name}</span>
        <ChevronDownIcon className="size-4.5 text-gray-500 transition-transform duration-200 group-data-popup-open:rotate-180 dark:text-gray-400" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={17} className="w-65">
        <div className="px-3 pt-1 pb-3">
          <span className="block text-theme-sm font-medium text-gray-700 dark:text-gray-400">
            {user?.name}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {user?.email}
          </span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>Odjava</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
