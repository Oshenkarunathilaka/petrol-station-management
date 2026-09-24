/* eslint-disable */
import { requirePermission } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { FuelTypeTable } from '@/components/fuel/fuel-type-table';
import { FuelTypeForm } from '@/components/fuel/fuel-type-form';

export const metadata = {
  title: 'Fuel Types | Management System',
};

export default async function FuelTypesPage() {
  await requirePermission('/dashboard/fuel');
  
  const supabase = await createClient();
  const { data: fuelTypes } = await supabase
    .from('fuel_types')
    .select('*')
    .order('name');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fuel Types</h1>
          <p className="text-muted-foreground mt-1">
            Manage the types of fuel sold at this station.
          </p>
        </div>
        <FuelTypeForm />
      </div>

      <FuelTypeTable fuelTypes={fuelTypes || []} />
    </div>
  );
}
