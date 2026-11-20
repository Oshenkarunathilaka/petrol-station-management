/* eslint-disable */
import { createClient } from '@/lib/supabase/server';
import { NewDeliveryForm } from '@/components/deliveries/delivery-form';

export const revalidate = 0;

export default async function NewDeliveryPage() {
  const supabase = await createClient();

  // Fetch dropdown options
  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('id, name')
    .eq('status', 'ACTIVE')
    .order('name');

  const { data: fuelTypes } = await supabase
    .from('fuel_types')
    .select('id, name, code')
    .eq('status', 'ACTIVE')
    .order('name');

  const { data: tanks } = await supabase
    .from('tanks')
    .select('id, tank_number, fuel_type_id, capacity_liters')
    .eq('status', 'ACTIVE')
    .order('tank_number');

  const { data: employees } = await supabase
    .from('employees')
    .select('id, full_name, employee_code')
    .eq('status', 'ACTIVE')
    .order('full_name');

  return (
    <NewDeliveryForm
      suppliers={suppliers || []}
      fuelTypes={fuelTypes || []}
      tanks={tanks || []}
      employees={employees || []}
    />
  );
}
