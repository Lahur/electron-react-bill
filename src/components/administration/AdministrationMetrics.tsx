import { useAppSelector } from "../../app/hooks";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "../../icons";
import Badge from "../ui/badge/Badge";

const icons = [GroupIcon, BoxIconLine];

export default function AdministrationMetrics() {
  const metrics = useAppSelector((state) => state.dashboard.metrics);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {metrics.map((metric, index) => {
        const Icon = icons[index];
        return (
          <div
            key={metric.label}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <Icon className="text-gray-800 size-6 dark:text-white/90" />
            </div>

            <div className="flex items-end justify-between mt-5">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {metric.label}
                </span>
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {metric.value}
                </h4>
              </div>
              <Badge color={metric.trend === "up" ? "success" : "error"}>
                {metric.trend === "up" ? <ArrowUpIcon /> : <ArrowDownIcon />}
                {metric.growth}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}