'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getCurrentProfile } from '@/lib/auth-helpers';
import { createAuditLog } from '@/lib/audit';

async function requireRole(allowedRoles: string[]) {
  const profile = await getCurrentProfile();
  if (!profile || !allowedRoles.includes(profile.role_name)) {
    throw new Error('Unauthorized Action');
  }
  return profile;
}

export async function getHistoricalFuelPrice(fuelTypeId: string, transactionDate: string, transactionTime: string) {
  try {
    const supabase = await createClient();
    const targetTimestamp = new Date(`${transactionDate}T${transactionTime}`).toISOString();
    
    // Find the price where targetTimestamp is >= effective_from AND (targetTimestamp < effective_until OR effective_until IS NULL)
    const { data, error } = await supabase
      .from('fuel_prices')
      .select('price_per_liter')
      .eq('fuel_type_id', fuelTypeId)
      .lte('effective_from', targetTimestamp)
      .order('effective_from', { ascending: false }); // Get the most recent one that is <= targetTimestamp

    if (error) throw error;
    
    // Filter in JS for the IS NULL or < effective_until part, just to be safe with postgrest syntax
    const validPriceRecord = data.find((record: any) => {
      if (!record.effective_until) return true;
      return new Date(targetTimestamp) < new Date(record.effective_until);
    });

    if (!validPriceRecord) {
      return { error: 'No active fuel price found for this date and time.' };
    }
    
    return { price_per_liter: validPriceRecord.price_per_liter };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function addFuelTransaction(formData: FormData) {
  try {
    const profile = await requireRole(['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT']);
    
    const supabase = await createClient();

    const pump_id = formData.get('pump_id') as string;
    const nozzle_id = formData.get('nozzle_id') as string;
    const fuel_type_id = formData.get('fuel_type_id') as string;
    const transaction_date = formData.get('transaction_date') as string;
    const transaction_time = formData.get('transaction_time') as string;
    const quantity_liters = Number(formData.get('quantity_liters'));
    const unit_price = Number(formData.get('unit_price'));
    const payment_method = formData.get('payment_method') as string;
    const employee_id = formData.get('employee_id') as string;
    const shift_id = formData.get('shift_id') as string;
    const notes = formData.get('notes') as string | null;

    if (!pump_id || !nozzle_id || !fuel_type_id || !transaction_date || !transaction_time || quantity_liters <= 0 || unit_price < 0 || !payment_method || !employee_id || !shift_id) {
      return { error: 'Missing or invalid required fields.' };
    }

    const timestamp = new Date(`${transaction_date}T${transaction_time}`).toISOString();

    const { data: nozzleData } = await supabase.from('pump_nozzles').select('fuel_type_id').eq('id', nozzle_id).single();
    if (nozzleData?.fuel_type_id !== fuel_type_id) {
      return { error: 'Fuel type mismatch for the selected nozzle.' };
    }

    const priceRes = await getHistoricalFuelPrice(fuel_type_id, transaction_date, transaction_time);
    if (priceRes.error) return { error: priceRes.error };
    
    if (Number(priceRes.price_per_liter) !== unit_price) {
      return { error: 'Price validation failed. Please refresh the price.' };
    }

    const total_amount = quantity_liters * unit_price;

    const { data: txData, error: txError } = await supabase.from('fuel_transactions').insert({
      transaction_date: timestamp,
      pump_id,
      employee_id,
      shift_id,
      payment_method,
      total_amount,
      status: 'COMPLETED',
      notes
    }).select('id').single();

    if (txError || !txData) {
      return { error: 'Failed to create transaction record.' };
    }

    const { error: itemError } = await supabase.from('transaction_items').insert({
      transaction_id: txData.id,
      nozzle_id,
      fuel_type_id,
      quantity_liters,
      unit_price
    });

    if (itemError) {
      await supabase.from('fuel_transactions').delete().eq('id', txData.id);
      return { error: 'Failed to create transaction item.' };
    }

    await createAuditLog({
      action: 'CREATE',
      module: 'Transactions',
      recordId: txData.id,
      newValue: {
        pump_id,
        nozzle_id,
        fuel_type_id,
        quantity_liters,
        unit_price,
        total_amount,
        payment_method,
        status: 'COMPLETED',
        employee_id,
        shift_id,
        notes
      },
      userId: profile.id
    });

    revalidatePath('/dashboard/transactions');
    return { success: true, transactionId: txData.id };
  } catch (error: any) {
    return { error: error.message };
  }
}

