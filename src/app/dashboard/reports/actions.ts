'use server';

import { createClient } from '@/lib/supabase/server';
import { requirePermission, getCurrentUser } from '@/lib/auth-helpers';
import { REPORT_CONFIGS, ReportType } from '@/lib/reports/config';
import { createAuditLog } from '@/lib/audit';

export async function logReportExport(reportType: string, dateFrom: string, dateTo: string, filters: any, fileName: string) {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data, error } = await supabase.from('report_exports').insert([{
    report_type: reportType,
    date_from: dateFrom || null,
    date_to: dateTo || null,
    filters: filters,
    generated_by: user.id,
    file_name: fileName,
  }]).select().single();

  if (!error && data) {
    await createAuditLog({
      action: 'EXPORT',
      module: 'Reports',
      recordId: data.id,
      newValue: {
        report_type: reportType,
        date_from: dateFrom,
        date_to: dateTo,
        filters,
        file_name: fileName
      },
      userId: user.id
    });
  }
}


export async function generateReport(type: ReportType, filters: any) {
  const { role } = await requirePermission('/dashboard/reports');
  const config = REPORT_CONFIGS[type];
  
  if (!config) throw new Error('Invalid report type');
  if (!role || !config.allowedRoles.includes(role)) {
    throw new Error('Unauthorized to view this report');
  }

  const supabase = await createClient();
  const { startDate, endDate } = filters;

  // Reusable date filter function
  const applyDateFilter = (query: any, dateColumn: string) => {
    if (startDate) query.gte(dateColumn, startDate);
    if (endDate) query.lte(dateColumn, endDate);
    return query;
  };

  switch (type) {
    case 'fuel-sales': {
      let q = supabase.from('transaction_items').select(`
        *,
        fuel:fuel_types(name),
        nozzle:pump_nozzles(nozzle_number),
        transaction:fuel_transactions!inner(
          transaction_date,
          payment_method,
          pump:pumps(pump_number),
          employee:employees(full_name),
          shift:shifts(start_time, end_time)
        )
      `);
      
      if (startDate) q.gte('transaction.transaction_date', startDate);
      if (endDate) q.lte('transaction.transaction_date', endDate);
      
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      
      const flattened = data.map((item: any) => ({
        date: item.transaction?.transaction_date,
        fuel: item.fuel?.name,
        pump: item.transaction?.pump?.pump_number,
        nozzle: item.nozzle?.nozzle_number,
        quantity: item.quantity_liters,
        unitPrice: item.unit_price,
        total: item.subtotal,
        paymentMethod: item.transaction?.payment_method,
        employee: item.transaction?.employee?.full_name,
      })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const kpis = {
        totalRevenue: flattened.reduce((sum, r) => sum + Number(r.total), 0),
        totalVolume: flattened.reduce((sum, r) => sum + Number(r.quantity), 0),
        transactionCount: flattened.length
      };
      
      return { kpis, data: flattened };
    }

    case 'fuel': {
      let q = supabase.from('transaction_items').select(`
        quantity_liters,
        subtotal,
        fuel:fuel_types(name),
        transaction:fuel_transactions!inner(transaction_date)
      `);
      
      if (startDate) q.gte('transaction.transaction_date', startDate);
      if (endDate) q.lte('transaction.transaction_date', endDate);
      
      const { data, error } = await q;
      if (error) throw new Error(error.message);

      const aggregated: Record<string, any> = {};
      data.forEach(t => {
        const fuelName = t.fuel?.name || 'Unknown';
        if (!aggregated[fuelName]) {
          aggregated[fuelName] = { fuel: fuelName, quantity: 0, revenue: 0, count: 0 };
        }
        aggregated[fuelName].quantity += Number(t.quantity_liters);
        aggregated[fuelName].revenue += Number(t.subtotal);
        aggregated[fuelName].count += 1;
      });

      const processedData = Object.values(aggregated).map(a => ({
        ...a,
        averagePrice: a.quantity > 0 ? a.revenue / a.quantity : 0
      }));

      const kpis = {
        totalRevenue: processedData.reduce((sum, r) => sum + r.revenue, 0),
        totalVolume: processedData.reduce((sum, r) => sum + r.quantity, 0),
        transactionCount: data.length
      };

      return { kpis, data: processedData };
    }

    case 'employee-sales': {
      let q = supabase.from('transaction_items').select(`
        quantity_liters,
        subtotal,
        transaction:fuel_transactions!inner(
          transaction_date,
          employee:employees(full_name)
        )
      `);
      
      if (startDate) q.gte('transaction.transaction_date', startDate);
      if (endDate) q.lte('transaction.transaction_date', endDate);
      
      const { data, error } = await q;
      if (error) throw new Error(error.message);

      const aggregated: Record<string, any> = {};
      data.forEach(t => {
        const empName = t.transaction?.employee?.full_name || 'Unknown';
        if (!aggregated[empName]) {
          aggregated[empName] = { employee: empName, quantity: 0, revenue: 0, count: 0 };
        }
        aggregated[empName].quantity += Number(t.quantity_liters);
        aggregated[empName].revenue += Number(t.subtotal);
        aggregated[empName].count += 1;
      });

      return { 
        kpis: { totalRevenue: data.reduce((sum, r) => sum + Number(r.subtotal), 0) }, 
        data: Object.values(aggregated) 
      };
    }

    case 'tank-stock': {
      const { data, error } = await supabase.from('tanks').select(`
        tank_number,
        fuel:fuel_types(name),
        capacity,
        current_stock
      `);
      if (error) throw new Error(error.message);
      
      const kpis = {
        totalStock: data.reduce((sum, t) => sum + Number(t.current_stock), 0)
      };

      return { kpis, data };
    }
    
    case 'tank-variance': {
      let q = supabase.from('tank_readings').select(`
        *,
        tank:tanks(tank_number, fuel:fuel_types(name))
      `).order('reading_date', { ascending: false });
      q = applyDateFilter(q, 'reading_date');
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      
      const kpis = {
        totalVariance: data.reduce((sum, r) => sum + Number(r.variance), 0)
      };
      
      return { kpis, data };
    }

    case 'expense': {
      let q = supabase.from('expenses').select(`
        *,
        recorder:profiles!expenses_recorded_by_fkey(full_name)
      `).order('expense_date', { ascending: false });
      q = applyDateFilter(q, 'expense_date');
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      
      const kpis = {
        totalExpense: data.reduce((sum, e) => sum + Number(e.amount), 0)
      };
      return { kpis, data };
    }

    case 'maintenance': {
      let q = supabase.from('maintenance').select(`
        *,
        reporter:profiles!maintenance_reported_by_fkey(full_name),
        assignee:profiles!maintenance_assigned_to_fkey(full_name)
      `).order('created_at', { ascending: false });
      q = applyDateFilter(q, 'start_date');
      const { data, error } = await q;
      if (error) throw new Error(error.message);

      const kpis = {
        totalCost: data.reduce((sum, m) => sum + Number(m.cost || 0), 0),
        taskCount: data.length
      };
      return { kpis, data };
    }

    case 'incident': {
      let q = supabase.from('incidents').select(`
        *,
        reporter:profiles!incidents_reported_by_fkey(full_name)
      `).order('incident_date', { ascending: false });
      q = applyDateFilter(q, 'incident_date');
      const { data, error } = await q;
      if (error) throw new Error(error.message);

      const kpis = {
        totalIncidents: data.length,
        criticalIncidents: data.filter(i => i.priority === 'CRITICAL').length
      };
      return { kpis, data };
    }

    case 'inventory': {
      let q = supabase.from('inventory_items').select('*');
      const { data, error } = await q;
      if (error) throw new Error(error.message);

      const kpis = {
        totalValue: data.reduce((sum, i) => sum + (Number(i.current_stock) * Number(i.purchase_price)), 0)
      };
      return { kpis, data };
    }

    case 'delivery': {
      let q = supabase.from('fuel_deliveries').select(`
        *,
        supplier:suppliers(name),
        fuel:fuel_types(name),
        tank:tanks(tank_number)
      `).order('delivery_date', { ascending: false });
      q = applyDateFilter(q, 'delivery_date');
      const { data, error } = await q;
      if (error) throw new Error(error.message);

      const kpis = {
        totalVolume: data.reduce((sum, d) => sum + Number(d.quantity_received), 0),
        totalCost: data.reduce((sum, d) => sum + Number(d.total_cost), 0)
      };
      return { kpis, data };
    }

    case 'shift':
    case 'cash-reconciliation': {
      let q = supabase.from('shifts').select(`
        *,
        shift_assignments(
           employee:employees(full_name)
        )
      `).order('start_time', { ascending: false });
      if (filters.startDate) q.gte('start_time', `${filters.startDate}T00:00:00Z`);
      if (filters.endDate) q.lte('start_time', `${filters.endDate}T23:59:59Z`);
      const { data, error } = await q;
      if (error) throw new Error(error.message);

      const kpis = {
        totalShifts: data.length
      };
      return { kpis, data };
    }

    case 'pump': {
      let q = supabase.from('pump_readings').select(`
        *,
        nozzle:pump_nozzles(nozzle_number, pump:pumps(pump_number)),
        employee:employees(full_name)
      `).order('reading_date', { ascending: false });
      q = applyDateFilter(q, 'reading_date');
      const { data, error } = await q;
      if (error) throw new Error(error.message);

      const formatted = data.map((r: any) => ({
        date: r.reading_date,
        time: r.reading_time,
        pump: r.nozzle?.pump?.pump_number,
        nozzle: r.nozzle?.nozzle_number,
        previousMeter: r.previous_meter,
        currentMeter: r.current_meter,
        volumeSold: r.fuel_sold_liters,
        employee: r.employee?.full_name
      }));

      const kpis = {
        totalVolumeSold: data.reduce((sum, r) => sum + Number(r.fuel_sold_liters || 0), 0)
      };
      return { kpis, data: formatted };
    }

    default:
      return { kpis: {}, data: [] };
  }
}
