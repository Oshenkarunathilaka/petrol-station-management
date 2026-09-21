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

export default async function DashboardPage() {
  await requirePermission('/dashboard');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your petrol station operations and performance.
        </p>
      </div>

      <DashboardFilters />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="col-span-1 xl:col-span-1">
          <KpiCard 
            title="Today's Revenue" 
            value="$24,500" 
            icon={DollarSign} 
            trend="up" 
            trendValue="12.5% from yesterday"
          />
        </div>
        <div className="col-span-1 xl:col-span-1">
          <KpiCard 
            title="Fuel Sold" 
            value="15,300 L" 
            icon={Droplet} 
            trend="up" 
            trendValue="8.2% from yesterday"
          />
        </div>
        <div className="col-span-1 xl:col-span-1">
          <KpiCard 
            title="Total Transactions" 
            value="452" 
            icon={CreditCard} 
            trend="up" 
            trendValue="5% from yesterday"
          />
        </div>
        <div className="col-span-1 xl:col-span-1">
          <KpiCard 
            title="Current Fuel Stock" 
            value="85,000 L" 
            icon={Container} 
            description="Across 4 tanks"
          />
        </div>
        <div className="col-span-1 xl:col-span-1">
          <KpiCard 
            title="Active Pumps" 
            value="3/4" 
            icon={Fuel} 
            trend="down" 
            trendValue="1 pump offline"
          />
        </div>
        <div className="col-span-1 xl:col-span-1">
          <KpiCard 
            title="Stock Variance" 
            value="25 L" 
            icon={AlertCircle} 
            trend="down" 
            trendValue="-0.03% (Within limits)"
          />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <RevenueChart />
        <FuelSalesChart />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
        <OperationalAlerts />
        <PaymentChart />
        <PumpStatus />
      </div>

      <RecentTransactions />
    </div>
  );
}
