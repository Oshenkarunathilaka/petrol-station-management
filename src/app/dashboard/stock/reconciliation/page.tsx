import { createClient } from '@/lib/supabase/server';
import { ReconciliationForm } from '@/components/stock/reconciliation-form';
import { RoleGuard } from '@/components/auth/role-guard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function ReconciliationPage() {
  const supabase = await createClient();

  const { data: tanks } = await supabase
    .from('tanks')
    .select('id, tank_number, fuel_types(name)')
    .order('tank_number');

  return (
    <RoleGuard allowedRoles={['ADMIN', 'MANAGER']}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/stock">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">New Stock Reconciliation</h2>
        </div>
        
        <div className="max-w-4xl">
          <ReconciliationForm tanks={tanks || []} />
        </div>
      </div>
    </RoleGuard>
  );
}
