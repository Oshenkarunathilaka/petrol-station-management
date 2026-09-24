import { requirePermission } from "@/lib/auth-helpers";
import { DollarSign, Droplet, CreditCard, Container, Fuel, AlertCircle } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { FuelSalesChart } from "@/components/dashboard/fuel-sales-chart";
import { PaymentChart } from "@/components/dashboard/payment-chart";
import { PumpStatus } from "@/components/dashboard/pump-status";
import { OperationalAlerts } from "@/components/dashboard/operational-alerts";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { 
  getDashboardKPIs, 
  getRevenueChartData, 
  getFuelSalesChartData, 
  getPaymentChartData, 
  getPumpStatuses, 
  getOperationalAlerts, 
  getRecentTransactions,
  getFilterOptions,
  DashboardFilters as FiltersType
} from "@/lib/dashboard-queries";

export default async function DashboardPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  await requirePermission('/dashboard');
  
  const searchParams = await props.searchParams;
  
  const filters: FiltersType = {
    range: (searchParams?.range as string) || 'today',
    fuelTypeId: (searchParams?.fuelTypeId as string) || 'all',
    pumpId: (searchParams?.pumpId as string) || 'all',
    shiftId: (searchParams?.shiftId as string) || 'all',
  };

  const [
    kpis,
    revenueData,
    fuelSalesData,
    paymentData,
    pumps,
    alerts,
    transactions,
    filterOptions
  ] = await Promise.all([
    getDashboardKPIs(filters),
    getRevenueChartData(filters),
    getFuelSalesChartData(filters),
    getPaymentChartData(filters),
    getPumpStatuses(),
    getOperationalAlerts(),
    getRecentTransactions(filters),
    getFilterOptions()
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your petrol station operations and performance.
        </p>
      </div>

      <DashboardFilters fuels={filterOptions.fuels} pumps={filterOptions.pumps} shifts={filterOptions.shifts} />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="col-span-1 xl:col-span-1">
          <KpiCard 
            title={filters.range === 'today' ? "Today's Revenue" : "Revenue"} 
            value={`Rs ${kpis.revenue.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
            icon={DollarSign} 
            trend={kpis.revenue.trend} 
            trendValue={kpis.revenue.trendValue}
          />
        </div>
        <div className="col-span-1 xl:col-span-1">
          <KpiCard 
            title="Fuel Sold" 
            value={`${kpis.volume.value.toLocaleString()} L`} 
            icon={Droplet} 
            trend={kpis.volume.trend} 
            trendValue={kpis.volume.trendValue}
          />
        </div>
        <div className="col-span-1 xl:col-span-1">
          <KpiCard 
            title="Total Transactions" 
            value={kpis.transactions.value.toLocaleString()} 
            icon={CreditCard} 
            trend={kpis.transactions.trend} 
            trendValue={kpis.transactions.trendValue}
          />
        </div>
        <div className="col-span-1 xl:col-span-1">
          <KpiCard 
            title="Current Fuel Stock" 
            value={`${kpis.stock.value.toLocaleString()} L`} 
            icon={Container} 
            description={kpis.stock.description}
          />
        </div>
        <div className="col-span-1 xl:col-span-1">
          <KpiCard 
            title="Active Pumps" 
            value={kpis.pumps.value} 
            icon={Fuel} 
            trend={kpis.pumps.trend} 
            trendValue={kpis.pumps.trendValue}
          />
        </div>
        <div className="col-span-1 xl:col-span-1">
          <KpiCard 
            title="Stock Variance" 
            value={`${kpis.variance.value} L`} 
            icon={AlertCircle} 
            trend={kpis.variance.trend} 
            trendValue={kpis.variance.trendValue}
          />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <RevenueChart data={revenueData} />
        <FuelSalesChart data={fuelSalesData} />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
        <OperationalAlerts alerts={alerts} />
        <PaymentChart data={paymentData} />
        <PumpStatus pumps={pumps} />
      </div>

      <RecentTransactions transactions={transactions} />
    </div>
  );
}
