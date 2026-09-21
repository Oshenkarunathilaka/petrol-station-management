import { requirePermission } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Container, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const metadata = {
  title: 'Tank Details | Management System',
};

export default async function TankDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission('/dashboard/tanks');
  const { id } = await params;
  
  const supabase = await createClient();

  // Fetch tank details
  const { data: tank, error } = await supabase
    .from('tanks')
    .select(`
      *,
      fuel_types (id, name, code, unit)
    `)
    .eq('id', id)
    .single();

  if (error || !tank) {
    notFound();
  }

  // Fetch recent readings
  const { data: recentReadings } = await supabase
    .from('tank_readings')
    .select('id, reading_date, reading_time, height_cm, calculated_liters, employees (full_name)')
    .eq('tank_id', id)
    .order('reading_date', { ascending: false })
    .order('reading_time', { ascending: false })
    .limit(5);

  // Fetch recent deliveries
  const { data: recentDeliveries } = await supabase
    .from('fuel_deliveries')
    .select('id, delivery_date, quantity_liters, status')
    .eq('tank_id', id)
    .order('delivery_date', { ascending: false })
    .limit(5);

  const currentStock = recentReadings?.[0]?.calculated_liters || 0;
  const stockPercentage = tank.capacity_liters > 0 
    ? Math.min(100, Math.max(0, (currentStock / tank.capacity_liters) * 100))
    : 0;
    
  const isLowStock = currentStock < tank.minimum_stock_liters;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-full">
            <Container className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tank {tank.tank_number}</h1>
            <p className="text-muted-foreground mt-1">
              {/* @ts-expect-error - relation */}
              {tank.fuel_types?.name} ({tank.fuel_types?.code})
            </p>
          </div>
        </div>
        <Badge 
          variant={tank.status === 'ACTIVE' ? 'default' : 'secondary'} 
          className="text-sm px-3 py-1"
        >
          {tank.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
            {isLowStock ? (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            ) : (
              <Container className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isLowStock ? 'text-destructive' : ''}`}>
              {currentStock.toLocaleString()} L
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stockPercentage.toFixed(1)}% of capacity
            </p>
            <Progress value={stockPercentage} className="mt-3" indicatorClassName={isLowStock ? 'bg-destructive' : ''} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity</CardTitle>
            <Container className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tank.capacity_liters.toLocaleString()} L</div>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum allowed storage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minimum Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tank.minimum_stock_liters.toLocaleString()} L</div>
            <p className="text-xs text-muted-foreground mt-1">
              Threshold for low stock warnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Space</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(0, tank.capacity_liters - currentStock).toLocaleString()} L
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Remaining capacity for deliveries
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Readings</CardTitle>
            <CardDescription>Latest manual stock measurements</CardDescription>
          </CardHeader>
          <CardContent>
            {recentReadings && recentReadings.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Height (cm)</TableHead>
                      <TableHead>Stock (L)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentReadings.map((reading) => (
                      <TableRow key={reading.id}>
                        <TableCell>
                          {new Date(reading.reading_date).toLocaleDateString()} {reading.reading_time}
                        </TableCell>
                        <TableCell>{reading.height_cm}</TableCell>
                        <TableCell className="font-medium">{reading.calculated_liters.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent readings found.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Deliveries</CardTitle>
            <CardDescription>Latest fuel stock replenishments</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDeliveries && recentDeliveries.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Quantity (L)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentDeliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell>
                          {new Date(delivery.delivery_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium text-emerald-600 flex items-center gap-1">
                          <ArrowUpRight className="h-3 w-3" />
                          {delivery.quantity_liters.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{delivery.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent deliveries found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
