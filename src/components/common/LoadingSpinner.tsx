import {Spinner} from "@/components/ui/spinner";
import {useAppSelector} from "../../app/hooks";

export default function LoadingSpinner() {
  const isLoading = useAppSelector((state) => state.ui.pendingRequests > 0);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-gray-900/20 dark:bg-gray-900/50">
      <Spinner className="size-12 text-brand-500" />
    </div>
  );
}
