import PageMeta from "../../components/common/PageMeta";
import AdministrationMetrics from "../../components/administration/AdministrationMetrics";
import MonthlySalesChart from "../../components/administration/MonthlySalesChart";
import StatisticsChart from "../../components/administration/StatisticsChart";
import MonthlyTarget from "../../components/administration/MonthlyTarget";
import RecentOrders from "../../components/administration/RecentOrders";
import DemographicCard from "../../components/administration/DemographicCard";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Administration Dashboard | electron-react-bill"
        description="Administration dashboard built from the TailAdmin React/Tailwind template, powered by demo data in Redux."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <AdministrationMetrics />

          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}