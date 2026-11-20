/* eslint-disable */
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateFuelPrice(fuelTypeId: string, newPrice: number) {
  const supabase = await createClient();

  const now = new Date().toISOString();

  // 1. Close the current active price
  await supabase
    .from('fuel_prices')
    .update({ effective_until: now })
    .eq('fuel_type_id', fuelTypeId)
    .is('effective_until', null);

  // 2. Insert the new price
  const { error } = await supabase
    .from('fuel_prices')
    .insert({
      fuel_type_id: fuelTypeId,
      price_per_liter: newPrice,
      effective_from: now,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/daily-entry');
  return { success: true };
}

export async function submitPumpReading(data: {
  employeeId: string;
  pumpId: string;
  nozzleId: string;
  fuelTypeId: string;
  opening: number;
  closing: number;
  expectedMoney: number;
  collectedMoney: number;
}) {
  const supabase = await createClient();

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0];

  // 1. Find or create an open shift for today
  let shiftId = null;
  const { data: shifts } = await supabase
    .from('shifts')
    .select('id')
    .eq('status', 'OPEN')
    .order('created_at', { ascending: false })
    .limit(1);

  if (shifts && shifts.length > 0) {
    shiftId = shifts[0].id;
  } else {
    // Create a new daily shift
    const { data: newShift, error: shiftError } = await supabase
      .from('shifts')
      .insert({
        name: `Daily Shift ${dateStr}`,
        shift_date: dateStr,
        start_time: '00:00:00',
        end_time: '23:59:59',
        status: 'OPEN'
      })
      .select('id')
      .single();
      
    if (shiftError) {
      return { success: false, error: 'Could not find or create a shift: ' + shiftError.message };
    }
    shiftId = newShift.id;
  }

  // 2. Record the pump reading for the nozzle
  //    NOTE: .select('id') so we hold the new row's id and can roll it back if a
  //    later step fails. Without the id, a failure below left an orphaned
  //    pump_readings row (a meter reading with no matching cash collection).
  const { data: pumpReading, error: readingError } = await supabase
    .from('pump_readings')
    .insert({
      nozzle_id: data.nozzleId,
      reading_date: dateStr,
      reading_time: timeStr,
      previous_meter: data.opening,
      current_meter: data.closing,
      employee_id: data.employeeId,
      shift_id: shiftId
    })
    .select('id')
    .single();

  if (readingError || !pumpReading) {
    return { success: false, error: 'Error recording meter reading: ' + (readingError?.message ?? 'no row returned') };
  }

  // 3. Record the shift reading (cash tracking)
  const { error: shiftReadingError } = await supabase
    .from('shift_readings')
    .insert({
      shift_id: shiftId,
      pump_id: data.pumpId,
      opening_reading: data.opening,
      closing_reading: data.closing,
      expected_cash: data.expectedMoney,
      actual_cash: data.collectedMoney
    });

  if (shiftReadingError) {
    // Compensating rollback: the meter reading above is already committed, so
    // remove it to keep the daily entry all-or-nothing and avoid duplicate
    // meter readings when the user retries.
    // NOTE: pump_readings DELETE is governed by RLS, so this needs a policy that
    // allows the operational roles (see supabase/migrations/015_step21_shift_readings_rls.sql).
    // Surface any failure instead of letting it disappear.
    const { error: rollbackError } = await supabase
      .from('pump_readings')
      .delete()
      .eq('id', pumpReading.id);

    return {
      success: false,
      error:
        'Error recording cash collection: ' + shiftReadingError.message +
        (rollbackError
          ? ' | WARNING: could not roll back the meter reading, so a duplicate may exist.'
          : ''),
    };
  }

  // Optional: Update employee assignment if not already assigned
  await supabase.from('shift_assignments').insert({
    shift_id: shiftId,
    employee_id: data.employeeId,
    role: 'ATTENDANT'
  }).select().limit(1); // ignore error if already assigned or just let it fail silently as it's optional

  // 4. Record an aggregate transaction so Dashboard charts (which read from fuel_transactions) are updated
  const quantityLiters = data.closing - data.opening;
  if (quantityLiters > 0) {
    const { data: tx, error: txError } = await supabase.from('fuel_transactions').insert({
      transaction_date: now.toISOString(),
      pump_id: data.pumpId,
      employee_id: data.employeeId,
      shift_id: shiftId,
      payment_method: 'CASH', // Defaulting to CASH for bulk shift daily entries
      total_amount: data.collectedMoney
    }).select('id').single();

    if (tx && !txError) {
      const unitPrice = data.expectedMoney / quantityLiters;
      await supabase.from('transaction_items').insert({
        transaction_id: tx.id,
        nozzle_id: data.nozzleId,
        fuel_type_id: data.fuelTypeId,
        quantity_liters: quantityLiters,
        unit_price: unitPrice
      });
    }
  }

  revalidatePath('/dashboard/daily-entry');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function cleanOrphanedPumpReadings() {
  const supabase = await createClient();

  // Execute a raw RPC or Supabase JS query to delete orphaned pump_readings.
  // Since Supabase JS lacks a direct way to do complex DELETE with JOINs or NOT EXISTS in a single query easily,
  // we will query the orphaned IDs first, then delete them in chunks or in one IN array.
  
  // 1. Fetch orphaned pump readings manually
  const { data: pumpReadings, error: fetchPrError } = await supabase
    .from('pump_readings')
    .select('id, shift_id, previous_meter, current_meter');
    
  if (fetchPrError || !pumpReadings) {
    return { success: false, error: fetchPrError?.message || 'Failed to fetch pump readings' };
  }

  const { data: shiftReadings, error: fetchSrError } = await supabase
    .from('shift_readings')
    .select('shift_id, opening_reading, closing_reading');

  if (fetchSrError || !shiftReadings) {
    return { success: false, error: fetchSrError?.message || 'Failed to fetch shift readings' };
  }

  // Find orphaned IDs
  const orphanedIds = pumpReadings.filter(pr => {
    return !shiftReadings.some(sr => 
      sr.shift_id === pr.shift_id && 
      sr.opening_reading === pr.previous_meter && 
      sr.closing_reading === pr.current_meter
    );
  }).map(pr => pr.id);

  if (orphanedIds.length > 0) {
    const { error: deleteError } = await supabase
      .from('pump_readings')
      .delete()
      .in('id', orphanedIds);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }
  }

  revalidatePath('/dashboard/daily-entry');
  return { success: true, count: orphanedIds.length };
}
