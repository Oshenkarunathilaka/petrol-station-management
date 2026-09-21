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

export async function addShift(formData: FormData) {
  try {
    await requireRole(['ADMIN', 'MANAGER', 'SUPERVISOR']);
    const supabase = await createClient();

    const name = formData.get('name') as string;
    const shift_date = formData.get('shift_date') as string;
    const start_time = formData.get('start_time') as string;
    const end_time = formData.get('end_time') as string;
    const status = formData.get('status') as string;
    const notes = formData.get('notes') as string | null;

    if (!name || !shift_date || !start_time || !end_time || !status) {
      return { error: 'Missing required fields.' };
    }

    const { error } = await supabase.from('shifts').insert({
      name,
      shift_date,
      start_time,
      end_time,
      status,
      notes,
    });

    if (error) {
      return { error: 'Failed to create shift.' };
    }

    revalidatePath('/dashboard/shifts');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateShift(id: string, formData: FormData) {
  try {
    await requireRole(['ADMIN', 'MANAGER', 'SUPERVISOR']);
    const supabase = await createClient();

    const name = formData.get('name') as string;
    const shift_date = formData.get('shift_date') as string;
    const start_time = formData.get('start_time') as string;
    const end_time = formData.get('end_time') as string;
    const status = formData.get('status') as string;
    const notes = formData.get('notes') as string | null;

    if (!name || !shift_date || !start_time || !end_time || !status) {
      return { error: 'Missing required fields.' };
    }

    const { error } = await supabase.from('shifts').update({
      name,
      shift_date,
      start_time,
      end_time,
      status,
      notes,
    }).eq('id', id);

    if (error) {
      return { error: 'Failed to update shift.' };
    }

    revalidatePath('/dashboard/shifts');
    revalidatePath(`/dashboard/shifts/${id}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
