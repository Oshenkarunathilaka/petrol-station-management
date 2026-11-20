/* eslint-disable */
import { createClient } from '@/lib/supabase/server';
import DailyEntryClient from '@/components/daily-entry/daily-entry-form';

interface PumpRow {
  id: string;
  pump_number: string;
}

interface NozzleRow {
  id: string;
  pump_id: string;
  nozzle_number: number;
  fuel_type_id: string;
}

interface FuelPriceRow {
  price_per_liter: number | string;
  effective_from: string;
}

interface FuelTypeRow {
  id: string;
  name: string;
  code: string;
  fuel_prices: FuelPriceRow[];
}

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
  const fuelTypes = ((fuelTypesData ?? []) as FuelTypeRow[]).map((fuelType) => {
    const prices = [...fuelType.fuel_prices].sort((a, b) =>
      new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime()
    );
    const latestPrice = Number(prices[0]?.price_per_liter ?? 0);

    return {
      id: fuelType.id,
      name: fuelType.name,
      code: fuelType.code,
      price: latestPrice,
    };
  });

  // Fetch active employees (pumpmen)
  const { data: employees } = await supabase
    .from('employees')
    .select('id, full_name, employee_code')
    .eq('status', 'ACTIVE');

  // Fetch active pumps and nozzles separately so the nozzle selector does not
  // depend on an embedded PostgREST relation being available.
  const [{ data: pumpsData }, { data: nozzlesData }] = await Promise.all([
    supabase
      .from('pumps')
      .select('id, pump_number')
      .eq('status', 'ACTIVE')
      .order('pump_number'),
    supabase
      .from('pump_nozzles')
      .select('id, pump_id, nozzle_number, fuel_type_id')
      .eq('status', 'ACTIVE')
      .order('pump_id')
      .order('nozzle_number'),
  ]);

  // Get last meter readings for nozzles to pre-fill opening meter
  const { data: lastReadings } = await supabase
    .from('pump_readings')
    .select('nozzle_id, current_meter')
    .order('created_at', { ascending: false });

  // Map latest reading per nozzle. A current meter of zero is still a valid
  // reading, so use property presence rather than a truthiness check.
  const latestMeterMap: Record<string, number> = {};
  for (const reading of lastReadings ?? []) {
    if (!(reading.nozzle_id in latestMeterMap)) {
      latestMeterMap[reading.nozzle_id] = Number(reading.current_meter);
    }
  }

  const nozzlesByPump = new Map<string, NozzleRow[]>();
  for (const nozzle of (nozzlesData ?? []) as NozzleRow[]) {
    const pumpNozzles = nozzlesByPump.get(nozzle.pump_id) ?? [];
    pumpNozzles.push(nozzle);
    nozzlesByPump.set(nozzle.pump_id, pumpNozzles);
  }

  const pumps = ((pumpsData ?? []) as PumpRow[]).map((pump) => ({
    id: pump.id,
    pump_number: pump.pump_number,
    nozzles: (nozzlesByPump.get(pump.id) ?? []).map((nozzle) => ({
      id: nozzle.id,
      nozzle_number: nozzle.nozzle_number,
      fuel_type_id: nozzle.fuel_type_id,
      last_meter: latestMeterMap[nozzle.id] ?? 0,
    })),
  }));

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
