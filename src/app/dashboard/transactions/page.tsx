/* eslint-disable */
// @ts-nocheck
import { requirePermission } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { TransactionTable } from '@/components/transactions/transaction-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Transactions | Management System',
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string, payment?: string }>;
}) {
  await requirePermission('/dashboard/transactions');
  const { date, payment } = await searchParams;
  
  const supabase = await createClient();

  // Fetch transactions with related data
  let query = supabase
    .from('fuel_transactions')
    .select(`
      id,
      transaction_date,
      payment_method,
      total_amount,
      status,
      pumps (pump_number),
      employees (full_name),
      shifts (name),
      transaction_items (
        quantity_liters,
        unit_price,
        pump_nozzles (nozzle_number),
        fuel_types (code)
      )
    `)
    .order('transaction_date', { ascending: false });

  if (date) {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    query = query.gte('transaction_date', `${date}T00:00:00Z`).lt('transaction_date', nextDay.toISOString());
  }
  if (payment) query = query.eq('payment_method', payment);

  const { data: transactions } = await query;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fuel Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage point-of-sale fuel sales.
          </p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/dashboard/transactions/new">
            <Plus className="h-4 w-4" />
            New Transaction
          </Link>
        </Button>
      </div>

      {/* Basic Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-md border bg-card">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Payment Method</label>
          <div className="flex flex-wrap gap-2">
            <Link href={`/dashboard/transactions${date ? `?date=${date}` : ''}`}>
              <Badge variant={!payment ? 'default' : 'outline'} className="cursor-pointer">All</Badge>
            </Link>
            {['CASH', 'CARD', 'QR', 'OTHER'].map(p => (
              <Link key={p} href={`/dashboard/transactions?payment=${p}${date ? `&date=${date}` : ''}`}>
                <Badge variant={payment === p ? 'default' : 'outline'} className="cursor-pointer">{p}</Badge>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Date Filter</label>
          <Link href={`/dashboard/transactions${payment ? `?payment=${payment}` : ''}`}>
            <Badge variant={!date ? 'default' : 'outline'} className="cursor-pointer mr-2">All Time</Badge>
          </Link>
          <Link href={`/dashboard/transactions?date=${new Date().toISOString().split('T')[0]}${payment ? `&payment=${payment}` : ''}`}>
            <Badge variant={date ? 'default' : 'outline'} className="cursor-pointer">Today</Badge>
          </Link>
        </div>
      </div>

      <TransactionTable transactions={transactions || []} />
    </div>
  );
}
