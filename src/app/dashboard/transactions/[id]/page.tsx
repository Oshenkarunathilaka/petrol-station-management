/* eslint-disable */
import { requirePermission } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Receipt, Calendar, CreditCard, Droplet, User, Fuel } from 'lucide-react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata = {
  title: 'Transaction Details | Management System',
};

export default async function TransactionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission('/dashboard/transactions');
  const { id } = await params;
  
  const supabase = await createClient();

  const { data: tx, error } = await supabase
    .from('fuel_transactions')
    .select(`
      *,
      pumps (pump_number),
      employees (full_name, employee_code),
      shifts (name, shift_date),
      transaction_items (
        quantity_liters,
        unit_price,
        total_amount,
        pump_nozzles (nozzle_number),
        fuel_types (name, code)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !tx) {
    notFound();
  }

  const d = new Date(tx.transaction_date);
  const item = tx.transaction_items?.[0]; // Assuming 1 item per tx

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/transactions" className="p-2 rounded-full hover:bg-muted transition-colors">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Receipt #{tx.id.split('-')[0].toUpperCase()}</h1>
            <Badge variant={tx.status === 'COMPLETED' ? 'default' : 'destructive'}>{tx.status}</Badge>
          </div>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            {tx.id}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Main Details (Left 2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Receipt className="h-5 w-5" />
                Sale Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border divide-y">
                <div className="grid grid-cols-2 p-4">
                  <div className="text-muted-foreground">Product</div>
                  <div className="font-medium flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-primary" />
                    {item?.fuel_types?.name} ({item?.fuel_types?.code})
                  </div>
                </div>
                <div className="grid grid-cols-2 p-4 bg-muted/20">
                  <div className="text-muted-foreground">Quantity</div>
                  <div className="font-medium">{item?.quantity_liters} Liters</div>
                </div>
                <div className="grid grid-cols-2 p-4">
                  <div className="text-muted-foreground">Unit Price</div>
                  <div className="font-medium">Rs. {item?.unit_price}</div>
                </div>
                <div className="grid grid-cols-2 p-4 bg-muted/30">
                  <div className="text-lg font-bold">Total Amount</div>
                  <div className="text-xl font-bold text-emerald-600">
                    Rs. {tx.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {tx.notes && (
                <div className="mt-4 p-4 bg-muted/50 rounded-md border text-sm">
                  <span className="font-semibold block mb-1">Notes:</span>
                  {tx.notes}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Metadata (Right col) */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                <Calendar className="h-4 w-4" />
                Time & Place
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Date & Time</div>
                <div className="font-medium">{d.toLocaleDateString()} {d.toLocaleTimeString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Dispenser</div>
                <div className="font-medium flex items-center gap-2">
                  <Fuel className="h-4 w-4" />
                  {tx.pumps?.pump_number} - Nozzle {item?.pump_nozzles?.nozzle_number}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                <CreditCard className="h-4 w-4" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-base px-3 py-1">{tx.payment_method}</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                <User className="h-4 w-4" />
                Personnel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Employee</div>
                <div className="font-medium">{tx.employees?.full_name}</div>
                <div className="text-xs text-muted-foreground">{tx.employees?.employee_code}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Shift</div>
                <div className="font-medium">{tx.shifts?.name}</div>
                <div className="text-xs text-muted-foreground">{new Date(tx.shifts?.shift_date).toLocaleDateString()}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
