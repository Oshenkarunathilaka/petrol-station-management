/* eslint-disable */
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getCurrentProfile } from '@/lib/auth-helpers';
import { createAuditLog } from '@/lib/audit';

// Helper to check roles
async function requireRole(allowedRoles: string[]) {
  const profile = await getCurrentProfile();
  if (!profile || !allowedRoles.includes(profile.role_name)) {
    throw new Error('Unauthorized Action');
  }
  return profile;
}

export async function addTank(formData: FormData) {
  try {
    const profile = await requireRole(['ADMIN', 'MANAGER']);
    const supabase = await createClient();

    const tank_number = formData.get('tank_number') as string;
    const fuel_type_id = formData.get('fuel_type_id') as string;
    const capacity_liters = Number(formData.get('capacity_liters'));
    const minimum_stock_liters = Number(formData.get('minimum_stock_liters'));
    const status = formData.get('status') as string;
    const notes = formData.get('notes') as string | null;

    if (!tank_number || !fuel_type_id || capacity_liters <= 0 || minimum_stock_liters < 0 || minimum_stock_liters > capacity_liters) {
      return { error: 'Invalid form data. Please check capacity and minimum stock values.' };
    }

    const { data: insertedTank, error } = await supabase.from('tanks').insert({
      tank_number,
      fuel_type_id,
      capacity_liters,
      minimum_stock_liters,
      status,
      notes,
    }).select().single();

    if (error) {
      if (error.code === '23505') {
        return { error: 'Tank number already exists.' };
      }
      console.error('Error inserting tank:', error);
      return { error: 'Failed to create tank. Please try again.' };
    }

    if (insertedTank) {
      await createAuditLog({
        action: 'CREATE',
        module: 'Tanks',
        recordId: insertedTank.id,
        newValue: insertedTank,
        userId: profile.id
      });
    }

    revalidatePath('/dashboard/tanks');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateTank(id: string, formData: FormData) {
  try {
    const profile = await requireRole(['ADMIN', 'MANAGER']);
    const supabase = await createClient();

    const tank_number = formData.get('tank_number') as string;
    const fuel_type_id = formData.get('fuel_type_id') as string;
    const capacity_liters = Number(formData.get('capacity_liters'));
    const minimum_stock_liters = Number(formData.get('minimum_stock_liters'));
    const status = formData.get('status') as string;
    const notes = formData.get('notes') as string | null;

    if (!tank_number || !fuel_type_id || capacity_liters <= 0 || minimum_stock_liters < 0 || minimum_stock_liters > capacity_liters) {
      return { error: 'Invalid form data. Please check capacity and minimum stock values.' };
    }

    const { data: oldTank } = await supabase.from('tanks').select('*').eq('id', id).single();

    const { error } = await supabase.from('tanks').update({
      tank_number,
      fuel_type_id,
      capacity_liters,
      minimum_stock_liters,
      status,
      notes,
    }).eq('id', id);

    if (error) {
      if (error.code === '23505') {
        return { error: 'Tank number already exists.' };
      }
      console.error('Error updating tank:', error);
      return { error: 'Failed to update tank. Please try again.' };
    }

    await createAuditLog({
      action: 'UPDATE',
      module: 'Tanks',
      recordId: id,
      oldValue: oldTank,
      newValue: { tank_number, fuel_type_id, capacity_liters, minimum_stock_liters, status, notes },
      userId: profile.id
    });

    revalidatePath('/dashboard/tanks');
    revalidatePath(`/dashboard/tanks/${id}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function addCalibration(formData: FormData) {
  try {
    const profile = await requireRole(['ADMIN', 'MANAGER']);
    const supabase = await createClient();

    const tank_id = formData.get('tank_id') as string;
    const height_cm = Number(formData.get('height_cm'));
    const quantity_liters = Number(formData.get('quantity_liters'));
    const status = formData.get('status') as string;

    if (!tank_id || height_cm < 0 || quantity_liters < 0) {
      return { error: 'Invalid calibration data.' };
    }

    const { data: insertedCal, error } = await supabase.from('tank_calibrations').insert({
      tank_id,
      height_cm,
      quantity_liters,
      status,
    }).select().single();

    if (error) {
      if (error.code === '23505') {
        return { error: 'A calibration entry for this height already exists for this tank.' };
      }
      console.error('Error inserting calibration:', error);
      return { error: 'Failed to create calibration entry.' };
    }

    if (insertedCal) {
      await createAuditLog({
        action: 'CREATE',
        module: 'Tank Calibration',
        recordId: insertedCal.id,
        newValue: insertedCal,
        userId: profile.id
      });
    }

    revalidatePath('/dashboard/tanks/calibrations');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteCalibration(id: string) {
  try {
    const profile = await requireRole(['ADMIN', 'MANAGER']);
    const supabase = await createClient();

    const { data: oldCal } = await supabase.from('tank_calibrations').select('*').eq('id', id).single();

    const { error } = await supabase.from('tank_calibrations').delete().eq('id', id);

    if (error) {
      console.error('Error deleting calibration:', error);
      return { error: 'Failed to delete calibration entry.' };
    }

    await createAuditLog({
      action: 'DELETE',
      module: 'Tank Calibration',
      recordId: id,
      oldValue: oldCal,
      userId: profile.id
    });

    revalidatePath('/dashboard/tanks/calibrations');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getCalculatedLiters(tankId: string, heightCm: number) {
  try {
    const supabase = await createClient();
    
    // Exact match query
    const { data, error } = await supabase
      .from('tank_calibrations')
      .select('quantity_liters')
      .eq('tank_id', tankId)
      .eq('height_cm', heightCm)
      .eq('status', 'ACTIVE')
      .single();

    if (error) {
      return { error: 'Calibration value not found for the entered height.' };
    }
    
    return { liters: data.quantity_liters };
  } catch (error: any) {
    return { error: 'Failed to fetch calibration data.' };
  }
}

export async function addTankReading(formData: FormData) {
  try {
    await requireRole(['ADMIN', 'MANAGER', 'SUPERVISOR']);
    const profile = await getCurrentProfile();
    const supabase = await createClient();

    const tank_id = formData.get('tank_id') as string;
    const reading_date = formData.get('reading_date') as string;
    const reading_time = formData.get('reading_time') as string;
    const height_cm = Number(formData.get('height_cm'));
    const calculated_liters = Number(formData.get('calculated_liters'));
    const employee_id = formData.get('employee_id') as string;
    const shift_id = formData.get('shift_id') as string;
    const notes = formData.get('notes') as string | null;

    if (!tank_id || !reading_date || !reading_time || height_cm < 0 || calculated_liters < 0 || !employee_id || !shift_id) {
      return { error: 'Missing required fields.' };
    }

    // Double check calibration on server
    const { data: calData } = await supabase
      .from('tank_calibrations')
      .select('quantity_liters')
      .eq('tank_id', tank_id)
      .eq('height_cm', height_cm)
      .eq('status', 'ACTIVE')
      .single();
      
    if (!calData || calData.quantity_liters !== calculated_liters) {
      return { error: 'Calibration validation failed. The entered height does not match the calculated liters.' };
    }

    const { data: insertedReading, error } = await supabase.from('tank_readings').insert({
      tank_id,
      reading_date,
      reading_time,
      height_cm,
      calculated_liters,
      employee_id,
      shift_id,
      notes,
    }).select().single();

    if (error) {
      console.error('Error inserting tank reading:', error);
      return { error: 'Failed to save tank reading.' };
    }

    if (insertedReading) {
      await createAuditLog({
        action: 'CREATE',
        module: 'Tank Readings',
        recordId: insertedReading.id,
        newValue: insertedReading,
        userId: profile?.id
      });
    }

    revalidatePath('/dashboard/tanks');
    revalidatePath(`/dashboard/tanks/${tank_id}`);
    revalidatePath('/dashboard/tanks/readings');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

