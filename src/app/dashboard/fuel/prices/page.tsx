/* eslint-disable */
// @ts-nocheck
import { requirePermission } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { FuelPriceTable } from '@/components/fuel/fuel-price-table';
import { FuelPriceForm } from '@/components/fuel/fuel-price-form';

export const metadata = {
  title: 'Fuel Prices | Management System',
};

export default async function FuelPricesPage() {
  await requirePermission('/dashboard/fuel-prices');
  
  const supabase = await createClient();
  
  // Fetch fuel prices with fuel types
  const { data: fuelPrices } = await supabase
    .from('fuel_prices')
    .select('*, fuel_types!inner(id, name, code, status)')
    .order('effective_from', { ascending: false });

  // We also need the fuel types to populate the Add Price dropdown
  const { data: fuelTypes } = await supabase
    .from('fuel_types')
    .select('*')
    .order('name');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fuel Prices</h1>
          <p className="text-muted-foreground mt-1">
            Manage current and historical fuel pricing.
          </p>
        </div>
        <FuelPriceForm fuelTypes={fuelTypes || []} />
      </div>

      {/* @ts-expect-error - Supabase join typing is complex without full generic typing */}
      <FuelPriceTable fuelPrices={fuelPrices || []} />
    </div>
  );
}
