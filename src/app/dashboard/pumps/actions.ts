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

export async function addPump(formData: FormData) {
  try {
    const profile = await requireRole(['ADMIN', 'MANAGER']);
    const supabase = await createClient();

    const pump_number = formData.get('pump_number') as string;
    const location = formData.get('location') as string | null;
    const status = formData.get('status') as string;
    const notes = formData.get('notes') as string | null;

    if (!pump_number || !status) {
      return { error: 'Pump number and status are required.' };
    }

    const { data: insertedPump, error } = await supabase.from('pumps').insert({
      pump_number,
      location,
      status,
      notes,
    }).select().single();

    if (error) {
      if (error.code === '23505') {
        return { error: 'Pump number already exists.' };
      }
      return { error: 'Failed to create pump.' };
    }

    if (insertedPump) {
      await createAuditLog({
        action: 'CREATE',
        module: 'Pumps',
        recordId: insertedPump.id,
        newValue: insertedPump,
        userId: profile.id
      });
    }

    revalidatePath('/dashboard/pumps');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updatePump(id: string, formData: FormData) {
  try {
    const profile = await requireRole(['ADMIN', 'MANAGER']);
    const supabase = await createClient();

    const pump_number = formData.get('pump_number') as string;
    const location = formData.get('location') as string | null;
    const status = formData.get('status') as string;
    const notes = formData.get('notes') as string | null;

    if (!pump_number || !status) {
      return { error: 'Pump number and status are required.' };
    }

    const { data: oldPump } = await supabase.from('pumps').select('*').eq('id', id).single();

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

    await createAuditLog({
      action: 'UPDATE',
      module: 'Pumps',
      recordId: id,
      oldValue: oldPump,
      newValue: { pump_number, location, status, notes },
      userId: profile.id
    });

    revalidatePath('/dashboard/pumps');
    revalidatePath(`/dashboard/pumps/${id}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function addNozzle(formData: FormData) {
  try {
    const profile = await requireRole(['ADMIN', 'MANAGER']);
    const supabase = await createClient();

    const pump_id = formData.get('pump_id') as string;
    const nozzle_number = Number(formData.get('nozzle_number'));
    const fuel_type_id = formData.get('fuel_type_id') as string;
    const status = formData.get('status') as string;

    if (!pump_id || nozzle_number <= 0 || !fuel_type_id || !status) {
      return { error: 'All fields are required and nozzle number must be greater than zero.' };
    }

    const { data: insertedNozzle, error } = await supabase.from('pump_nozzles').insert({
      pump_id,
      nozzle_number,
      fuel_type_id,
      status,
    }).select().single();

    if (error) {
      if (error.code === '23505') {
        return { error: 'This nozzle number already exists for this pump.' };
      }
      return { error: 'Failed to create nozzle.' };
    }

    if (insertedNozzle) {
      await createAuditLog({
        action: 'CREATE',
        module: 'Nozzles',
        recordId: insertedNozzle.id,
        newValue: insertedNozzle,
        userId: profile.id
      });
    }

    revalidatePath(`/dashboard/pumps/${pump_id}`);
    revalidatePath('/dashboard/daily-entry');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteNozzle(id: string, pump_id: string) {
  try {
    const profile = await requireRole(['ADMIN', 'MANAGER']);
    const supabase = await createClient();

    const { data: oldNozzle } = await supabase.from('pump_nozzles').select('*').eq('id', id).single();

    const { error } = await supabase.from('pump_nozzles').delete().eq('id', id);

    if (error) {
      return { error: 'Failed to delete nozzle.' };
    }

    await createAuditLog({
      action: 'DELETE',
      module: 'Nozzles',
      recordId: id,
      oldValue: oldNozzle,
      userId: profile.id
    });

    revalidatePath(`/dashboard/pumps/${pump_id}`);
    revalidatePath('/dashboard/daily-entry');
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
      return { previous_meter: null };
    }
    
    return { previous_meter: data.current_meter };
  } catch (error: any) {
    return { error: 'Failed to fetch previous reading.' };
  }
}

export async function addPumpReading(formData: FormData) {
  try {
    const profile = await requireRole(['ADMIN', 'MANAGER', 'SUPERVISOR', 'ATTENDANT']);
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

    const latestData = await getLatestNozzleReading(nozzle_id);
    if (!latestData.error && latestData.previous_meter !== null) {
      if (latestData.previous_meter !== previous_meter) {
        return { error: `Previous reading mismatch. Expected ${latestData.previous_meter} but got ${previous_meter}.` };
      }
    }

    const { data: insertedReading, error } = await supabase.from('pump_readings').insert({
      nozzle_id,
      reading_date,
      reading_time,
      previous_meter,
      current_meter,
      employee_id,
      shift_id,
      notes,
    }).select().single();

    if (error) {
      return { error: 'Failed to save pump reading.' };
    }

    if (insertedReading) {
      await createAuditLog({
        action: 'CREATE',
        module: 'Pump Readings',
        recordId: insertedReading.id,
        newValue: insertedReading,
        userId: profile.id
      });
    }

    revalidatePath('/dashboard/pumps/readings');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function addPumpAssignment(formData: FormData) {
  try {
    const profile = await requireRole(['ADMIN', 'MANAGER', 'SUPERVISOR']);
    const supabase = await createClient();

    const pump_id = formData.get('pump_id') as string;
    const employee_id = formData.get('employee_id') as string;
    const shift_id = formData.get('shift_id') as string;
    const assigned_from = formData.get('assigned_from') as string;
    const assigned_until = formData.get('assigned_until') as string | null;
    const status = formData.get('status') as string;

    if (!pump_id || !employee_id || !shift_id || !assigned_from) {
      return { error: 'Missing required fields.' };
    }

    const { data: insertedAssign, error } = await supabase.from('pump_assignments').insert({
      pump_id,
      employee_id,
      shift_id,
      assigned_from,
      assigned_until: assigned_until || null,
      status,
    }).select().single();

    if (error) {
      return { error: 'Failed to create pump assignment.' };
    }

    if (insertedAssign) {
      await createAuditLog({
        action: 'CREATE',
        module: 'Pumps',
        recordId: insertedAssign.id,
        newValue: insertedAssign,
        userId: profile.id
      });
    }

    revalidatePath('/dashboard/pumps/assignments');
    revalidatePath(`/dashboard/pumps/${pump_id}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

