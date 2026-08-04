import PageMeta from "../../components/common/PageMeta";
import AdministrationMetrics from "../../components/administration/AdministrationMetrics";
import MonthlySalesChart from "../../components/administration/MonthlySalesChart";
import StatisticsChart from "../../components/administration/StatisticsChart";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Administracijska nadzorna ploča | Tehnomodus administracija"
        description="Administracijska nadzorna ploča izrađena na temelju TailAdmin React/Tailwind predloška, pokretana demo podacima u Reduxu."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6">
          <AdministrationMetrics />

          <MonthlySalesChart />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>
      </div>
    </>
  );
}