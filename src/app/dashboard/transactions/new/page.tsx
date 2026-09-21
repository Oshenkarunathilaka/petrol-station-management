import { requirePermission } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'New Transaction | Management System',
};

export default async function NewTransactionPage() {
  await requirePermission('/dashboard/transactions');
  
  const supabase = await createClient();

  // Fetch reference data for the form
  const { data: pumps } = await supabase
    .from('pumps')
    .select(`
      id, 
      pump_number,
      pump_nozzles (
        id, 
        nozzle_number,
        fuel_types (id, name, code)
      )
    `)
    .eq('status', 'ACTIVE')
    .order('pump_number');

  const { data: employees } = await supabase
    .from('employees')
    .select('id, full_name')
    .eq('status', 'ACTIVE')
    .order('full_name');

  const { data: shifts } = await supabase
    .from('shifts')
    .select('id, name')
    .eq('status', 'OPEN')
    .order('shift_date', { ascending: false });

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/transactions" className="p-2 rounded-full hover:bg-muted transition-colors">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Transaction</h1>
          <p className="text-muted-foreground mt-1">
            Record a point-of-sale fuel transaction.
          </p>
        </div>
      </div>

      <TransactionForm 
        pumps={pumps || []} 
        employees={employees || []} 
        shifts={shifts || []} 
      />
    </div>
  );
}
