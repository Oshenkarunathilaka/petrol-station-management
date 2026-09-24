import { requirePermission } from "@/lib/auth-helpers";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { FuelSalesChart } from "@/components/dashboard/fuel-sales-chart";
import { PaymentChart } from "@/components/dashboard/payment-chart";
import { 
  getRevenueChartData, 
  getFuelSalesChartData, 
  getPaymentChartData, 
  DashboardFilters as FiltersType
} from "@/lib/dashboard-queries";

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  await requirePermission('/dashboard/analytics');
  
  const searchParams = await props.searchParams;
  
  const filters: FiltersType = {
    range: (searchParams?.range as string) || 'this_month',
    fuelTypeId: (searchParams?.fuelTypeId as string) || 'all',
    pumpId: (searchParams?.pumpId as string) || 'all',
    shiftId: (searchParams?.shiftId as string) || 'all',
  };

  const [
    revenueData,
    fuelSalesData,
    paymentData,
  ] = await Promise.all([
    getRevenueChartData(filters),
    getFuelSalesChartData(filters),
    getPaymentChartData(filters),
  ]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 pt-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Deep dive into your station's historical performance and trends.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <RevenueChart data={revenueData} />
        <FuelSalesChart data={fuelSalesData} />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <PaymentChart data={paymentData} />
        {/* Placeholder for more analytics */}
        <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="text-xl font-semibold mb-2">More Analytics Coming Soon</h3>
          <p className="text-slate-500 text-center">We are actively building predictive modeling, peak hour analysis, and pumpman performance metrics.</p>
        </div>
      </div>
    </div>
  );
}
