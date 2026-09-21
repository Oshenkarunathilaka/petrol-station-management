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

export async function assignEmployeeToShift(formData: FormData) {
  try {
    await requireRole(['ADMIN', 'MANAGER', 'SUPERVISOR']);
    const supabase = await createClient();

    const employee_id = formData.get('employee_id') as string;
    const shift_id = formData.get('shift_id') as string;
    const pump_id = formData.get('pump_id') as string;
    const role = formData.get('role') as string;
    const start_date = formData.get('start_date') as string;
    const start_time = formData.get('start_time') as string;
    const end_date = formData.get('end_date') as string;
    const end_time = formData.get('end_time') as string;
    const status = formData.get('status') as string;

    if (!employee_id || !shift_id || !pump_id || !role || !start_date || !start_time || !end_date || !end_time || !status) {
      return { error: 'Missing required fields.' };
    }

    const assigned_from = new Date(`${start_date}T${start_time}`).toISOString();
    const assigned_until = new Date(`${end_date}T${end_time}`).toISOString();

    if (new Date(assigned_until) <= new Date(assigned_from)) {
      return { error: 'End time must be after start time.' };
    }

    // 1. Create Shift Assignment
    const { error: shiftError } = await supabase.from('shift_assignments').insert({
      shift_id,
      employee_id,
      role,
      status
    });

    if (shiftError) {
      return { error: 'Failed to create shift assignment.' };
    }

    // 2. Create Pump Assignment
    const { error: pumpError } = await supabase.from('pump_assignments').insert({
      pump_id,
      employee_id,
      shift_id,
      assigned_from,
      assigned_until,
      status
    });

    if (pumpError) {
      return { error: 'Failed to create pump assignment.' };
    }

    revalidatePath('/dashboard/shifts/assignments');
    revalidatePath(`/dashboard/shifts/${shift_id}`);
    revalidatePath(`/dashboard/employees/${employee_id}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
