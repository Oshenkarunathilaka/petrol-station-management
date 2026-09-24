'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getStockDashboardMetrics() {
  const supabase = await createClient();

  // Get total capacity and total current stock (latest reading for each tank)
  const { data: tanks, error: tanksError } = await supabase
    .from('tanks')
    .select('id, capacity_liters, minimum_stock_liters, tank_number, fuel_types(name)');

  if (tanksError) {
    console.error('Error fetching tanks for metrics:', tanksError);
    return null;
  }

  let totalStock = 0;
  let totalCapacity = 0;
  let lowStockTanks = 0;

  for (const tank of tanks) {
    totalCapacity += Number(tank.capacity_liters);
    
    // Get latest reading
    const { data: latestReading } = await supabase
      .from('tank_readings')
      .select('calculated_liters, reading_date, reading_time')
      .eq('tank_id', tank.id)
      .order('reading_date', { ascending: false })
      .order('reading_time', { ascending: false })
      .limit(1)
      .single();

    const currentStock = latestReading ? Number(latestReading.calculated_liters) : 0;
    totalStock += currentStock;

    if (currentStock <= Number(tank.minimum_stock_liters)) {
      lowStockTanks++;
    }
  }

  // Get recent reconciliations for variances
  const { data: recentRecons, error: reconError } = await supabase
    .from('stock_reconciliations')
    .select('variance, status')
    .eq('status', 'FINALIZED')
    .order('reconciliation_date', { ascending: false })
    .limit(50);

  let positiveVariance = 0;
  let negativeVariance = 0;

  if (recentRecons && !reconError) {
    // Only count the latest finalized reconciliation for each tank? Or just overall?
    // Let's just sum all finalized reconciliations in the latest period. For simplicity, just use the latest 50.
    recentRecons.forEach(recon => {
      if (Number(recon.variance) > 0) positiveVariance++;
      if (Number(recon.variance) < 0) negativeVariance++;
    });
  }

  // Get total confirmed deliveries (this month or all time?) Let's do all time or this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: deliveries } = await supabase
    .from('fuel_deliveries')
    .select('quantity_liters')
    .eq('status', 'COMPLETED')
    .gte('delivery_date', startOfMonth.toISOString());

  const totalConfirmedDeliveries = deliveries ? deliveries.reduce((sum, d) => sum + Number(d.quantity_liters), 0) : 0;

  // Get total fuel sold (this month)
  const { data: sales } = await supabase
    .from('pump_readings')
    .select('fuel_sold_liters')
    .gte('reading_date', startOfMonth.toISOString().split('T')[0]);

  const totalFuelSold = sales ? sales.reduce((sum, s) => sum + Number(s.fuel_sold_liters), 0) : 0;

  return {
    totalStock,
    totalCapacity,
    lowStockTanks,
    positiveVariance,
    negativeVariance,
    totalConfirmedDeliveries,
    totalFuelSold
  };
}

export async function getTankStockTable() {
  const supabase = await createClient();

  const { data: tanks, error } = await supabase
    .from('tanks')
    .select('id, tank_number, capacity_liters, status, fuel_types(name)')
    .order('tank_number');

  if (error) return [];

  const tableData = await Promise.all(tanks.map(async (tank) => {
    // Get latest reconciliation
    const { data: latestRecon } = await supabase
      .from('stock_reconciliations')
      .select('*')
      .eq('tank_id', tank.id)
      .eq('status', 'FINALIZED')
      .order('reconciliation_date', { ascending: false })
      .order('closing_period_end', { ascending: false })
      .limit(1)
      .single();

    // Get latest reading
    const { data: latestReading } = await supabase
      .from('tank_readings')
      .select('calculated_liters, reading_date, reading_time')
      .eq('tank_id', tank.id)
      .order('reading_date', { ascending: false })
      .order('reading_time', { ascending: false })
      .limit(1)
      .single();

    return {
      id: tank.id,
      tank_number: tank.tank_number,
      fuel_type: tank.fuel_types?.name,
      capacity: tank.capacity_liters,
      status: tank.status,
      latestReconciliation: latestRecon,
      physical_stock: latestReading ? latestReading.calculated_liters : 0,
    };
  }));

  return tableData;
}

export async function calculateReconciliation(formData: FormData) {
  const supabase = await createClient();

  const tankId = formData.get('tank_id') as string;
  const dateStr = formData.get('reconciliation_date') as string;
  const openStr = formData.get('opening_period_start') as string;
  const closeStr = formData.get('closing_period_end') as string;

  if (!tankId || !dateStr || !openStr || !closeStr) {
    return { error: 'Missing required fields' };
  }

  // Parse dates
  const startDate = new Date(openStr);
  const endDate = new Date(closeStr);

  if (startDate >= endDate) {
    return { error: 'Opening period must be before closing period' };
  }

  // 1. Get Opening Stock
  // Look for a finalized reconciliation before or at the opening period start
  const { data: prevRecon } = await supabase
    .from('stock_reconciliations')
    .select('physical_closing_stock')
    .eq('tank_id', tankId)
    .eq('status', 'FINALIZED')
    .lte('closing_period_end', startDate.toISOString())
    .order('closing_period_end', { ascending: false })
    .limit(1)
    .single();

  let openingStock = 0;
  if (prevRecon) {
    openingStock = Number(prevRecon.physical_closing_stock);
  } else {
    // If no previous reconciliation, find the reading closest to start date
    const { data: openReading } = await supabase
      .from('tank_readings')
      .select('calculated_liters')
      .eq('tank_id', tankId)
      .lte('reading_date', startDate.toISOString().split('T')[0]) // Simplified, time omitted
      .order('reading_date', { ascending: false })
      .order('reading_time', { ascending: false })
      .limit(1)
      .single();
    
    if (openReading) {
      openingStock = Number(openReading.calculated_liters);
    }
  }

  // 2. Get Confirmed Deliveries between start and end
  const { data: deliveries } = await supabase
    .from('fuel_deliveries')
    .select('quantity_liters')
    .eq('tank_id', tankId)
    .eq('status', 'COMPLETED')
    .gte('delivery_date', startDate.toISOString())
    .lte('delivery_date', endDate.toISOString());

  const confirmedDeliveries = deliveries ? deliveries.reduce((sum, d) => sum + Number(d.quantity_liters), 0) : 0;

  // 3. Get Fuel Sold
  // We need to find pump readings for nozzles connected to this tank, between start and end.
  // First get nozzles for the tank's fuel type? Wait, nozzles are tied to fuel type, and tanks are tied to fuel type.
  // Actually, multiple tanks can have the same fuel type. 
  // Let's get the tank's fuel type.
  const { data: tank } = await supabase.from('tanks').select('fuel_type_id').eq('id', tankId).single();
  const fuelTypeId = tank?.fuel_type_id;

  // Then get all nozzles dispensing this fuel type
  const { data: nozzles } = await supabase.from('pump_nozzles').select('id').eq('fuel_type_id', fuelTypeId);
  const nozzleIds = nozzles?.map(n => n.id) || [];

  let fuelSold = 0;
  if (nozzleIds.length > 0) {
    // Get pump readings for these nozzles in the date range
    const { data: readings } = await supabase
      .from('pump_readings')
      .select('fuel_sold_liters, reading_date, reading_time')
      .in('nozzle_id', nozzleIds)
      // date filtering might be tricky due to split date/time columns.
      // We will filter in JS if they don't exactly match timestamp filtering.
      // But we can do a rough filter by date first.
      .gte('reading_date', startDate.toISOString().split('T')[0])
      .lte('reading_date', endDate.toISOString().split('T')[0]);

    if (readings) {
      readings.forEach(r => {
        const rDateTime = new Date(`${r.reading_date}T${r.reading_time}`);
        if (rDateTime >= startDate && rDateTime <= endDate) {
          fuelSold += Number(r.fuel_sold_liters);
        }
      });
    }
  }

  // 4. Expected Closing
  const expectedClosing = openingStock + confirmedDeliveries - fuelSold;

  // 5. Physical Stock (Latest valid tank reading within the period)
  const { data: closingReading } = await supabase
    .from('tank_readings')
    .select('calculated_liters, reading_date, reading_time')
    .eq('tank_id', tankId)
    .lte('reading_date', endDate.toISOString().split('T')[0])
    // We should ideally filter by time as well, but this requires JS filtering or a complex query
    .order('reading_date', { ascending: false })
    .order('reading_time', { ascending: false })
    .limit(50); // Get recent readings and find the latest one within period
    
  let physicalStock = null;
  
  if (closingReading) {
    for (const r of closingReading) {
      const rDateTime = new Date(`${r.reading_date}T${r.reading_time}`);
      if (rDateTime <= endDate && rDateTime >= startDate) {
        physicalStock = Number(r.calculated_liters);
        break; // found the latest one within period
      }
    }
  }

  if (physicalStock === null) {
    return { 
      error: 'No physical stock reading available.',
      details: {
        openingStock,
        confirmedDeliveries,
        fuelSold,
        expectedClosing
      }
    };
  }

  const variance = physicalStock - expectedClosing;

  return {
    success: true,
    data: {
      openingStock,
      confirmedDeliveries,
      fuelSold,
      expectedClosing,
      physicalStock,
      variance
    }
  };
}

export async function saveReconciliation(formData: FormData) {
  const supabase = await createClient();

  const tankId = formData.get('tank_id') as string;
  const dateStr = formData.get('reconciliation_date') as string;
  const openStr = formData.get('opening_period_start') as string;
  const closeStr = formData.get('closing_period_end') as string;
  const notes = formData.get('notes') as string;

  const calcResult = await calculateReconciliation(formData);

  if (calcResult.error || !calcResult.data) {
    return { error: calcResult.error || 'Calculation failed' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, roles(name)')
    .eq('id', user?.id)
    .single();

  if (!profile || !['ADMIN', 'MANAGER'].includes(profile.roles?.name)) {
    return { error: 'Unauthorized: Only Admin and Manager can save reconciliations' };
  }

  const { openingStock, confirmedDeliveries, fuelSold, physicalStock } = calcResult.data;

  const { error } = await supabase
    .from('stock_reconciliations')
    .insert({
      tank_id: tankId,
      reconciliation_date: dateStr,
      opening_period_start: new Date(openStr).toISOString(),
      closing_period_end: new Date(closeStr).toISOString(),
      opening_stock: openingStock,
      confirmed_deliveries: confirmedDeliveries,
      fuel_sold: fuelSold,
      physical_closing_stock: physicalStock,
      status: 'FINALIZED',
      notes,
      created_by: profile.id
    });

  if (error) {
    console.error('Save error:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/stock');
  revalidatePath(`/dashboard/stock/${tankId}`);
  redirect('/dashboard/stock');
}

export async function getTankReconciliations(tankId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('stock_reconciliations')
    .select('*, tanks(tank_number, fuel_types(name))')
    .eq('tank_id', tankId)
    .order('reconciliation_date', { ascending: false });

  if (error) return [];
  return data;
}
