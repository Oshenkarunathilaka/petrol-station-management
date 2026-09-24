import { createClient } from '@/lib/supabase/server';
import DailyEntryClient from './DailyEntryClient';

export const dynamic = 'force-dynamic';

export default async function DailyEntryPage() {
  const supabase = await createClient();

  // Fetch active fuel types with their latest price
  const { data: fuelTypesData } = await supabase
    .from('fuel_types')
    .select(`
      id,
      name,
      code,
      fuel_prices (
        price_per_liter,
        effective_from
      )
    `)
    .eq('status', 'ACTIVE');

  // Format fuel types to get the most recent price
  const fuelTypes = fuelTypesData?.map((ft: any) => {
    const prices = ft.fuel_prices || [];
    const latestPrice = prices.sort((a: any, b: any) => 
      new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime()
    )[0]?.price_per_liter || 0;

    return {
      id: ft.id,
      name: ft.name,
      code: ft.code,
      price: latestPrice,
    };
  }) || [];

  // Fetch active employees (pumpmen)
  const { data: employees } = await supabase
    .from('employees')
    .select('id, full_name, employee_code')
    .eq('status', 'ACTIVE');

  // Fetch pumps and their nozzles
  const { data: pumpsData } = await supabase
    .from('pumps')
    .select(`
      id,
      pump_number,
      pump_nozzles (
        id,
        nozzle_number,
        fuel_type_id
      )
    `)
    .eq('status', 'ACTIVE')
    .order('pump_number');

  // Get last meter readings for nozzles to pre-fill opening meter
  const { data: lastReadings } = await supabase
    .from('pump_readings')
    .select('nozzle_id, current_meter')
    .order('created_at', { ascending: false });

  // Map latest reading per nozzle
  const latestMeterMap: Record<string, number> = {};
  if (lastReadings) {
    for (const r of lastReadings) {
      if (!latestMeterMap[r.nozzle_id]) {
        latestMeterMap[r.nozzle_id] = r.current_meter;
      }
    }
  }

  const pumps = pumpsData?.map((p: any) => ({
    id: p.id,
    pump_number: p.pump_number,
    nozzles: p.pump_nozzles.map((n: any) => ({
      id: n.id,
      nozzle_number: n.nozzle_number,
      fuel_type_id: n.fuel_type_id,
      last_meter: latestMeterMap[n.id] || 0
    }))
  })) || [];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Daily Operations</h2>
      </div>
      
      <DailyEntryClient 
        fuelTypes={fuelTypes} 
        employees={employees || []} 
        pumps={pumps} 
      />
    </div>
  );
}
