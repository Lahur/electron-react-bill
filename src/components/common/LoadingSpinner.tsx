import {useAppSelector} from "../../app/hooks";

export default function LoadingSpinner() {
  const isLoading = useAppSelector((state) => state.ui.pendingRequests > 0);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/20 dark:bg-gray-900/50">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-gray-700 dark:border-t-brand-500" />
    </div>
  );
}