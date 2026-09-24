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
  const { error: readingError } = await supabase
    .from('pump_readings')
    .insert({
      nozzle_id: data.nozzleId,
      reading_date: dateStr,
      reading_time: timeStr,
      previous_meter: data.opening,
      current_meter: data.closing,
      employee_id: data.employeeId,
      shift_id: shiftId
    });

  if (readingError) {
    return { success: false, error: 'Error recording meter reading: ' + readingError.message };
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
    return { success: false, error: 'Error recording cash collection: ' + shiftReadingError.message };
  }

  // Optional: Update employee assignment if not already assigned
  await supabase.from('shift_assignments').insert({
    shift_id: shiftId,
    employee_id: data.employeeId,
    role: 'ATTENDANT'
  }).select().limit(1); // ignore error if already assigned or just let it fail silently as it's optional

  revalidatePath('/dashboard/daily-entry');
  return { success: true };
}
