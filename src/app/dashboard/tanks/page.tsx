import { requirePermission } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { TankTable } from '@/components/tanks/tank-table';
import { TankForm } from '@/components/tanks/tank-form';

export const metadata = {
  title: 'Tanks | Management System',
};

export default async function TanksPage() {
  await requirePermission('/dashboard/tanks');
  
  const supabase = await createClient();

  // Fetch fuel types for the form
  const { data: fuelTypes } = await supabase
    .from('fuel_types')
    .select('id, name, code, status')
    .eq('status', 'ACTIVE')
    .order('name');

  // Fetch tanks with fuel types and latest reading
  const { data: tanks } = await supabase
    .from('tanks')
    .select(`
      *,
      fuel_types (id, name, code),
      tank_readings (calculated_liters, created_at)
    `)
    .order('tank_number');

  // We need to sort tank_readings per tank to get the latest one
  // Supabase limits ordering on nested relations, so we process it here
  const processedTanks = tanks?.map(tank => {
    const sortedReadings = [...(tank.tank_readings || [])].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return {
      ...tank,
      tank_readings: sortedReadings
    };
  }) || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tank Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage underground storage tanks and monitor current stock levels.
          </p>
        </div>
        <TankForm fuelTypes={fuelTypes || []} />
      </div>

      {/* @ts-expect-error - Supabase join typing is complex */}
      <TankTable tanks={processedTanks} fuelTypes={fuelTypes || []} />
    </div>
  );
}
