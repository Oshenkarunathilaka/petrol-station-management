/* eslint-disable */
import { requirePermission } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { PumpTable } from '@/components/pumps/pump-table';
import { PumpForm } from '@/components/pumps/pump-form';

export const metadata = {
  title: 'Pumps | Management System',
};

export default async function PumpsPage() {
  await requirePermission('/dashboard/pumps');
  
  const supabase = await createClient();

  // Fetch pumps with nozzle count
  const { data: pumps } = await supabase
    .from('pumps')
    .select(`
      *,
      pump_nozzles (id)
    `)
    .order('pump_number');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pump Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage physical pump stations and view status.
          </p>
        </div>
        <PumpForm />
      </div>

      <PumpTable pumps={pumps || []} />
    </div>
  );
}
