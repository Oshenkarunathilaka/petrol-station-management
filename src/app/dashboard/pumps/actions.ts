'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getCurrentProfile } from '@/lib/auth-helpers';

async function requireRole(allowedRoles: string[]) {
  const profile = await getCurrentProfile();
  if (!profile || !allowedRoles.includes(profile.role_name)) {
    throw new Error('Unauthorized Action');
  }
  return profile;
}

export async function addPump(formData: FormData) {
  try {
    await requireRole(['ADMIN', 'MANAGER']);
    const supabase = await createClient();

    const pump_number = formData.get('pump_number') as string;
    const location = formData.get('location') as string | null;
    const status = formData.get('status') as string;
    const notes = formData.get('notes') as string | null;

    if (!pump_number || !status) {
      return { error: 'Pump number and status are required.' };
    }

    const { error } = await supabase.from('pumps').insert({
      pump_number,
      location,
      status,
      notes,
    });

    if (error) {
      if (error.code === '23505') {
        return { error: 'Pump number already exists.' };
      }
      return { error: 'Failed to create pump.' };
    }

    revalidatePath('/dashboard/pumps');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updatePump(id: string, formData: FormData) {
  try {
    await requireRole(['ADMIN', 'MANAGER']);
    const supabase = await createClient();

    const pump_number = formData.get('pump_number') as string;
    const location = formData.get('location') as string | null;
    const status = formData.get('status') as string;
    const notes = formData.get('notes') as string | null;

    if (!pump_number || !status) {
      return { error: 'Pump number and status are required.' };
    }

    const { error } = await supabase.from('pumps').update({
      pump_number,
      location,
      status,
      notes,
    }).eq('id', id);

    if (error) {
      if (error.code === '23505') {
        return { error: 'Pump number already exists.' };
      }
      return { error: 'Failed to update pump.' };
    }

    revalidatePath('/dashboard/pumps');
    revalidatePath(`/dashboard/pumps/${id}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function addNozzle(formData: FormData) {
  try {
    await requireRole(['ADMIN', 'MANAGER']);
    const supabase = await createClient();

    const pump_id = formData.get('pump_id') as string;
    const nozzle_number = Number(formData.get('nozzle_number'));
    const fuel_type_id = formData.get('fuel_type_id') as string;
    const status = formData.get('status') as string;

    if (!pump_id || nozzle_number <= 0 || !fuel_type_id || !status) {
      return { error: 'All fields are required and nozzle number must be greater than zero.' };
    }

    const { error } = await supabase.from('pump_nozzles').insert({
      pump_id,
      nozzle_number,
      fuel_type_id,
      status,
    });

    if (error) {
      if (error.code === '23505') {
        return { error: 'This nozzle number already exists for this pump.' };
      }
      return { error: 'Failed to create nozzle.' };
    }

    revalidatePath(`/dashboard/pumps/${pump_id}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteNozzle(id: string, pump_id: string) {
  try {
    await requireRole(['ADMIN', 'MANAGER']);
    const supabase = await createClient();

    const { error } = await supabase.from('pump_nozzles').delete().eq('id', id);

    if (error) {
      return { error: 'Failed to delete nozzle.' };
    }

    revalidatePath(`/dashboard/pumps/${pump_id}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getLatestNozzleReading(nozzleId: string) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('pump_readings')
      .select('current_meter')
      .eq('nozzle_id', nozzleId)
      .order('reading_date', { ascending: false })
      .order('reading_time', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      // Means this is the very first reading
      return { previous_meter: null };
    }
    
    return { previous_meter: data.current_meter };
  } catch (error: any) {
    return { error: 'Failed to fetch previous reading.' };
  }
}

export async function addPumpReading(formData: FormData) {
  try {
    await requireRole(['ADMIN', 'MANAGER', 'SUPERVISOR', 'ATTENDANT']);
    const supabase = await createClient();

    const nozzle_id = formData.get('nozzle_id') as string;
    const reading_date = formData.get('reading_date') as string;
    const reading_time = formData.get('reading_time') as string;
    const previous_meter = Number(formData.get('previous_meter'));
    const current_meter = Number(formData.get('current_meter'));
    const employee_id = formData.get('employee_id') as string;
    const shift_id = formData.get('shift_id') as string;
    const notes = formData.get('notes') as string | null;

    if (!nozzle_id || !reading_date || !reading_time || previous_meter < 0 || current_meter < 0 || !employee_id || !shift_id) {
      return { error: 'Missing or invalid required fields.' };
    }

    if (current_meter < previous_meter) {
      return { error: 'Current reading cannot be less than previous reading.' };
    }

    // Verify against DB explicitly to prevent manipulation
    const latestData = await getLatestNozzleReading(nozzle_id);
    if (!latestData.error && latestData.previous_meter !== null) {
      if (latestData.previous_meter !== previous_meter) {
        return { error: `Previous reading mismatch. Expected ${latestData.previous_meter} but got ${previous_meter}.` };
      }
    }

    // `fuel_sold_liters` is a GENERATED ALWAYS AS column in the DB, so we don't insert it directly.
    const { error } = await supabase.from('pump_readings').insert({
      nozzle_id,
      reading_date,
      reading_time,
      previous_meter,
      current_meter,
      employee_id,
      shift_id,
      notes,
    });

    if (error) {
      return { error: 'Failed to save pump reading.' };
    }

    revalidatePath('/dashboard/pumps/readings');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function addPumpAssignment(formData: FormData) {
  try {
    await requireRole(['ADMIN', 'MANAGER', 'SUPERVISOR']);
    const supabase = await createClient();

    const pump_id = formData.get('pump_id') as string;
    const employee_id = formData.get('employee_id') as string;
    const shift_id = formData.get('shift_id') as string;
    const assigned_from = formData.get('assigned_from') as string; // Expects full ISO datetime
    const assigned_until = formData.get('assigned_until') as string | null;
    const status = formData.get('status') as string;

    if (!pump_id || !employee_id || !shift_id || !assigned_from) {
      return { error: 'Missing required fields.' };
    }

    const { error } = await supabase.from('pump_assignments').insert({
      pump_id,
      employee_id,
      shift_id,
      assigned_from,
      assigned_until: assigned_until || null,
      status,
    });

    if (error) {
      return { error: 'Failed to create pump assignment.' };
    }

    revalidatePath('/dashboard/pumps/assignments');
    revalidatePath(`/dashboard/pumps/${pump_id}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
