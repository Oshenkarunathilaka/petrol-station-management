/* eslint-disable */
import { requirePermission } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { ShiftTable } from '@/components/shifts/shift-table';
import { ShiftForm } from '@/components/shifts/shift-form';

export const metadata = {
  title: 'Shifts | Management System',
};

export default async function ShiftsPage() {
  await requirePermission('/dashboard/shifts');
  
  const supabase = await createClient();

  // Fetch shifts with assignments counts
  const { data: shifts } = await supabase
    .from('shifts')
    .select(`
      *,
      shift_assignments (id),
      pump_assignments (id)
    `)
    .order('shift_date', { ascending: false })
    .order('start_time', { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shift Management</h1>
          <p className="text-muted-foreground mt-1">
            Schedule and manage operational shifts.
          </p>
        </div>
        <ShiftForm />
      </div>

      <ShiftTable shifts={shifts || []} />
    </div>
  );
}
