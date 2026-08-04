import { useEffect } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchStatistics } from "../../features/dashboard/dashboardSlice";

export default function StatisticsChart() {
  const dispatch = useAppDispatch();
  const { categories, salesPaid, salesUnpaid } = useAppSelector(
    (state) => state.dashboard.statistics,
  );
  const series = [
    { name: "Plaćeno", data: [...salesPaid] },
    { name: "Neplaćeno", data: [...salesUnpaid] },
  ];

  useEffect(() => {
    dispatch(fetchStatistics());
  }, [dispatch]);

  const options: ApexOptions = {
    legend: { show: true, position: "top", horizontalAlign: "left" },
    colors: ["#465FFF", "#F79009"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: { show: false },
    },
    stroke: { curve: "straight", width: [2, 2] },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.55, opacityTo: 0 },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      x: { format: "dd MMM yyyy" },
    },
    xaxis: {
      type: "category",
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
      },
      title: { text: "", style: { fontSize: "0px" } },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Statistika
        </h3>
        <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
          Pregled prodaje po mjesecima
        </p>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}