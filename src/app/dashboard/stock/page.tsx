import { getStockDashboardMetrics, getTankStockTable } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Droplet, CheckCircle, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { TankStockTable } from '@/components/stock/tank-stock-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function StockDashboardPage() {
  const metrics = await getStockDashboardMetrics();
  const tableData = await getTankStockTable();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Fuel Stock Reconciliation</h2>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/dashboard/stock/reconciliation">New Reconciliation</Link>
          </Button>
        </div>
      </div>

      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fuel Stock</CardTitle>
              <Droplet className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalStock.toLocaleString()} L</div>
              <p className="text-xs text-muted-foreground">
                Out of {metrics.totalCapacity.toLocaleString()} L capacity
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Tanks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.lowStockTanks}</div>
              <p className="text-xs text-muted-foreground">
                Tanks below minimum stock level
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed Deliveries</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalConfirmedDeliveries.toLocaleString()} L</div>
              <p className="text-xs text-muted-foreground">
                Total delivered this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fuel Sold</CardTitle>
              <Activity className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalFuelSold.toLocaleString()} L</div>
              <p className="text-xs text-muted-foreground">
                Based on pump readings this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positive Variances</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.positiveVariance}</div>
              <p className="text-xs text-muted-foreground">
                Recent finalizations with excess stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Negative Variances</CardTitle>
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.negativeVariance}</div>
              <p className="text-xs text-muted-foreground">
                Recent finalizations with stock loss
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tank Stock Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <TankStockTable data={tableData} />
        </CardContent>
      </Card>
    </div>
  );
}
