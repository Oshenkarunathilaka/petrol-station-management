/* eslint-disable */
import { createClient } from '@/lib/supabase/server';
import { startOfDay, endOfDay, subDays, formatISO, parseISO, format } from 'date-fns';

export interface DashboardFilters {
  range?: string; // 'today', 'yesterday', '7days', '30days'
  fuelTypeId?: string;
  pumpId?: string;
  shiftId?: string;
}

export function getDateRange(range?: string) {
  const now = new Date();
  let start: Date, end: Date;

  switch (range) {
    case 'yesterday':
      start = startOfDay(subDays(now, 1));
      end = endOfDay(subDays(now, 1));
      break;
    case '7days':
      start = startOfDay(subDays(now, 6));
      end = endOfDay(now);
      break;
    case '30days':
      start = startOfDay(subDays(now, 29));
      end = endOfDay(now);
      break;
    case 'today':
    default:
      start = startOfDay(now);
      end = endOfDay(now);
      break;
  }

  const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const prevStart = startOfDay(subDays(start, durationDays));
  const prevEnd = endOfDay(subDays(start, 1));

  return {
    current: { start: formatISO(start), end: formatISO(end) },
    previous: { start: formatISO(prevStart), end: formatISO(prevEnd) }
  };
}

function calculateTrend(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) return { trend: 'neutral' as const, trendValue: '0% from previous' };
    return { trend: 'up' as const, trendValue: '100% from previous' };
  }
  const percentChange = ((current - previous) / previous) * 100;
  const trend = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'neutral';
  return {
    trend: trend as 'up' | 'down' | 'neutral',
    trendValue: `${Math.abs(percentChange).toFixed(1)}% from previous`
  };
}

export async function getDashboardKPIs(filters: DashboardFilters) {
  const supabase = await createClient();
  const { current, previous } = getDateRange(filters.range);

  // 1. Current Period Transactions
  let currentTxQuery = supabase.from('fuel_transactions').select(`
    id, total_amount, transaction_date,
    items:transaction_items(quantity_liters, fuel_type_id)
  `).gte('transaction_date', current.start).lte('transaction_date', current.end);

  if (filters.pumpId && filters.pumpId !== 'all') currentTxQuery.eq('pump_id', filters.pumpId);
  if (filters.shiftId && filters.shiftId !== 'all') currentTxQuery.eq('shift_id', filters.shiftId);

  const { data: currentTxs, error: currentError } = await currentTxQuery;
  if (currentError) console.error("currentTxs error", currentError);

  // Apply fuel type filter to items if needed
  let currentRevenue = 0;
  let currentVolume = 0;
  let currentTxCount = 0;
  
  (currentTxs || []).forEach((tx: any) => {
    let validItems = tx.items || [];
    if (filters.fuelTypeId && filters.fuelTypeId !== 'all') {
      validItems = validItems.filter((item: any) => item.fuel_type_id === filters.fuelTypeId);
    }
    
    if (validItems.length > 0 || (!filters.fuelTypeId || filters.fuelTypeId === 'all')) {
      currentRevenue += Number(tx.total_amount || 0);
      currentTxCount += 1;
      validItems.forEach((item: any) => {
        currentVolume += Number(item.quantity_liters || 0);
      });
    }
  });

  // 2. Previous Period Transactions
  let prevTxQuery = supabase.from('fuel_transactions').select(`
    id, total_amount, transaction_date,
    items:transaction_items(quantity_liters, fuel_type_id)
  `).gte('transaction_date', previous.start).lte('transaction_date', previous.end);

  if (filters.pumpId && filters.pumpId !== 'all') prevTxQuery.eq('pump_id', filters.pumpId);
  if (filters.shiftId && filters.shiftId !== 'all') prevTxQuery.eq('shift_id', filters.shiftId);

  const { data: prevTxs } = await prevTxQuery;
  
  let prevRevenue = 0;
  let prevVolume = 0;
  let prevTxCount = 0;
  
  (prevTxs || []).forEach((tx: any) => {
    let validItems = tx.items || [];
    if (filters.fuelTypeId && filters.fuelTypeId !== 'all') {
      validItems = validItems.filter((item: any) => item.fuel_type_id === filters.fuelTypeId);
    }
    if (validItems.length > 0 || (!filters.fuelTypeId || filters.fuelTypeId === 'all')) {
      prevRevenue += Number(tx.total_amount || 0);
      prevTxCount += 1;
      validItems.forEach((item: any) => {
        prevVolume += Number(item.quantity_liters || 0);
      });
    }
  });

  // 3. Current Stock
  let stockQuery = supabase.from('tanks').select('current_stock, capacity');
  if (filters.fuelTypeId && filters.fuelTypeId !== 'all') {
     stockQuery.eq('fuel_type_id', filters.fuelTypeId);
  }
  const { data: tanks } = await stockQuery;
  const currentStock = (tanks || []).reduce((sum, tank) => sum + Number(tank.current_stock || 0), 0);
  const tankCount = (tanks || []).length;

  // 4. Active Pumps
  const { data: pumps } = await supabase.from('pumps').select('status');
  const activePumps = (pumps || []).filter(p => p.status === 'ACTIVE').length;
  const totalPumps = (pumps || []).length;

  // 5. Stock Variance (Current period)
  const { data: readings } = await supabase.from('tank_readings').select('variance')
    .gte('reading_date', current.start)
    .lte('reading_date', current.end);
    
  const currentVariance = (readings || []).reduce((sum, r) => sum + Number(r.variance || 0), 0);

  return {
    revenue: {
      value: currentRevenue,
      ...calculateTrend(currentRevenue, prevRevenue)
    },
    volume: {
      value: currentVolume,
      ...calculateTrend(currentVolume, prevVolume)
    },
    transactions: {
      value: currentTxCount,
      ...calculateTrend(currentTxCount, prevTxCount)
    },
    stock: {
      value: currentStock,
      description: `Across ${tankCount} tank${tankCount !== 1 ? 's' : ''}`
    },
    pumps: {
      value: `${activePumps}/${totalPumps}`,
      trend: activePumps < totalPumps ? 'down' : 'neutral',
      trendValue: totalPumps - activePumps > 0 ? `${totalPumps - activePumps} offline` : 'All pumps active'
    },
    variance: {
      value: currentVariance,
      trend: currentVariance < 0 ? 'down' : currentVariance > 0 ? 'up' : 'neutral',
      trendValue: 'Based on readings'
    }
  };
}

export async function getRevenueChartData(filters: DashboardFilters) {
  const supabase = await createClient();
  const { current } = getDateRange(filters.range);

  const { data } = await supabase.from('fuel_transactions').select(`
    total_amount, transaction_date
  `).gte('transaction_date', current.start).lte('transaction_date', current.end);

  // Group by hour or day depending on the range
  const isSingleDay = filters.range === 'today' || filters.range === 'yesterday' || !filters.range;
  
  const aggregated: Record<string, number> = {};
  
  (data || []).forEach(tx => {
    const date = new Date(tx.transaction_date);
    const key = isSingleDay ? format(date, 'HH:00') : format(date, 'MMM dd');
    aggregated[key] = (aggregated[key] || 0) + Number(tx.total_amount || 0);
  });

  // Sort chronologically and format
  const sortedKeys = Object.keys(aggregated).sort();
  
  // Calculate cumulative for single day to match previous mock "cumulative" chart, 
  // or just return raw amounts (returning raw is usually better for area charts, but let's do cumulative if it's single day)
  let runningTotal = 0;
  
  return sortedKeys.map(key => {
    if (isSingleDay) {
      runningTotal += aggregated[key];
      return { time: key, revenue: runningTotal };
    } else {
      return { time: key, revenue: aggregated[key] };
    }
  });
}

export async function getFuelSalesChartData(filters: DashboardFilters) {
  const supabase = await createClient();
  const { current } = getDateRange(filters.range);

  const { data } = await supabase.from('transaction_items').select(`
    quantity_liters,
    fuel:fuel_types(name, color),
    transaction:fuel_transactions!inner(transaction_date)
  `).gte('transaction.transaction_date', current.start).lte('transaction.transaction_date', current.end);

  const aggregated: Record<string, { volume: number, color: string }> = {};

  (data || []).forEach((item: any) => {
    const fuelName = item.fuel?.name || 'Unknown';
    const color = item.fuel?.color || '#cbd5e1';
    
    if (!aggregated[fuelName]) {
      aggregated[fuelName] = { volume: 0, color };
    }
    aggregated[fuelName].volume += Number(item.quantity_liters || 0);
  });

  return Object.entries(aggregated).map(([name, { volume, color }]) => ({
    name,
    value: volume,
    fill: color
  }));
}

export async function getPaymentChartData(filters: DashboardFilters) {
  const supabase = await createClient();
  const { current } = getDateRange(filters.range);

  const { data } = await supabase.from('fuel_transactions').select(`
    payment_method, total_amount
  `).gte('transaction_date', current.start).lte('transaction_date', current.end);

  const aggregated: Record<string, number> = {};
  
  (data || []).forEach(tx => {
    const method = tx.payment_method || 'UNKNOWN';
    aggregated[method] = (aggregated[method] || 0) + Number(tx.total_amount || 0);
  });

  const colors: Record<string, string> = {
    'CASH': '#10b981', // emerald-500
    'CARD': '#3b82f6', // blue-500
    'QR': '#8b5cf6',   // violet-500
    'CREDIT': '#f59e0b', // amber-500
  };

  return Object.entries(aggregated).map(([name, value]) => ({
    name,
    value,
    fill: colors[name] || '#64748b' // slate-500 default
  }));
}

export async function getPumpStatuses() {
  const supabase = await createClient();
  
  const { data } = await supabase.from('pumps').select(`
    pump_number,
    status,
    brand,
    nozzles:pump_nozzles(
      nozzle_number,
      fuel:fuel_types(name, color)
    )
  `).order('pump_number');

  return (data || []).map(pump => ({
    id: pump.pump_number,
    status: pump.status,
    nozzles: (pump.nozzles || []).map((n: any) => ({
      number: n.nozzle_number,
      fuelType: n.fuel?.name,
      color: n.fuel?.color
    }))
  }));
}

export async function getOperationalAlerts() {
  const supabase = await createClient();
  
  // Low Stock Alerts (Stock < Minimum Threshold)
  const { data: tanks } = await supabase.from('tanks').select('tank_number, current_stock, minimum_level, fuel:fuel_types(name)');
  const lowStock = (tanks || [])
    .filter(t => Number(t.current_stock) < Number(t.minimum_level))
    .map(t => ({
      id: `tank-${t.tank_number}`,
      type: 'warning' as const,
      title: 'Low Fuel Stock',
      message: `Tank ${t.tank_number} (${(t.fuel as any)?.name}) is below minimum level (${t.current_stock}L)`,
      time: 'Now'
    }));

  // Open Incidents
  const { data: incidents } = await supabase.from('incidents').select('id, incident_type, priority, created_at').in('status', ['OPEN', 'INVESTIGATING']);
  const activeIncidents = (incidents || []).map(i => ({
    id: `incident-${i.id}`,
    type: (i.priority === 'CRITICAL' || i.priority === 'HIGH') ? 'critical' as const : 'warning' as const,
    title: `Incident: ${i.incident_type.replace(/_/g, ' ')}`,
    message: 'Active incident requires attention',
    time: format(new Date(i.created_at), 'hh:mm a')
  }));

  // Open Maintenance
  const { data: maintenance } = await supabase.from('maintenance').select('id, title, priority, created_at').in('status', ['SCHEDULED', 'IN_PROGRESS']);
  const activeMaintenance = (maintenance || []).map(m => ({
    id: `maint-${m.id}`,
    type: 'info' as const,
    title: 'Maintenance',
    message: m.title,
    time: format(new Date(m.created_at), 'MMM dd')
  }));

  return [...lowStock, ...activeIncidents, ...activeMaintenance];
}

export async function getRecentTransactions(filters: DashboardFilters) {
  const supabase = await createClient();
  
  let q = supabase.from('fuel_transactions').select(`
    id,
    transaction_date,
    payment_method,
    total_amount,
    pump:pumps(pump_number),
    employee:employees(full_name),
    items:transaction_items(
      quantity_liters,
      fuel:fuel_types(name)
    )
  `).order('transaction_date', { ascending: false }).limit(5);

  if (filters.pumpId && filters.pumpId !== 'all') q.eq('pump_id', filters.pumpId);
  if (filters.shiftId && filters.shiftId !== 'all') q.eq('shift_id', filters.shiftId);

  const { data } = await q;

  return (data || []).map(tx => {
    const firstItem = tx.items?.[0] || {};
    return {
      id: `TRX-${tx.id.substring(0,6).toUpperCase()}`,
      fullId: tx.id,
      time: format(new Date(tx.transaction_date), 'hh:mm a'),
      pump: tx.pump ? `Pump ${(tx.pump as any).pump_number}` : 'Unknown',
      fuel: (firstItem as any).fuel?.name || 'Unknown',
      qty: `${Number((firstItem as any).quantity_liters || 0).toFixed(1)} L`,
      amount: `Rs ${Number(tx.total_amount).toFixed(2)}`,
      payment: tx.payment_method,
      employee: (tx.employee as any)?.full_name || 'Unknown'
    };
  });
}

export async function getFilterOptions() {
  const supabase = await createClient();
  
  const [fuelsRes, pumpsRes, shiftsRes] = await Promise.all([
    supabase.from('fuel_types').select('id, name').order('name'),
    supabase.from('pumps').select('id, pump_number').order('pump_number'),
    supabase.from('shifts').select('id, start_time, end_time').order('start_time', { ascending: false }).limit(10)
  ]);

  return {
    fuels: fuelsRes.data || [],
    pumps: pumpsRes.data || [],
    shifts: shiftsRes.data || []
  };
}
