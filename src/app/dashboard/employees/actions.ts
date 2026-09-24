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

export async function addEmployee(formData: FormData) {
  try {
    const profile = await requireRole(['ADMIN', 'MANAGER']);
    const supabase = await createClient();

    const employee_code = formData.get('employee_code') as string;
    const full_name = formData.get('full_name') as string;
    const phone = formData.get('phone') as string | null;
    const email = formData.get('email') as string | null;
    const position = formData.get('position') as string;
    const status = formData.get('status') as string;
    const hire_date = formData.get('hire_date') as string | null;
    const notes = formData.get('notes') as string | null;

    if (!employee_code || !full_name || !position || !status) {
      return { error: 'Employee ID, Name, Role, and Status are required.' };
    }

    const { data: insertedEmp, error } = await supabase.from('employees').insert({
      employee_code,
      full_name,
      phone,
      email: email || null,
      position,
      status,
      hire_date: hire_date || null,
      notes,
    }).select().single();

    if (error) {
      if (error.code === '23505') {
        return { error: 'Employee ID or Email already exists.' };
      }
      return { error: 'Failed to add employee.' };
    }

    if (insertedEmp) {
      await createAuditLog({
        action: 'CREATE',
        module: 'Employees',
        recordId: insertedEmp.id,
        newValue: insertedEmp,
        userId: profile.id
      });
    }

    revalidatePath('/dashboard/employees');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateEmployee(id: string, formData: FormData) {
  try {
    const profile = await requireRole(['ADMIN', 'MANAGER']);
    const supabase = await createClient();

    const employee_code = formData.get('employee_code') as string;
    const full_name = formData.get('full_name') as string;
    const phone = formData.get('phone') as string | null;
    const email = formData.get('email') as string | null;
    const position = formData.get('position') as string;
    const status = formData.get('status') as string;
    const hire_date = formData.get('hire_date') as string | null;
    const notes = formData.get('notes') as string | null;

    if (!employee_code || !full_name || !position || !status) {
      return { error: 'Employee ID, Name, Role, and Status are required.' };
    }

    const { data: oldEmp } = await supabase.from('employees').select('*').eq('id', id).single();

    const { error } = await supabase.from('employees').update({
      employee_code,
      full_name,
      phone,
      email: email || null,
      position,
      status,
      hire_date: hire_date || null,
      notes,
    }).eq('id', id);

    if (error) {
      if (error.code === '23505') {
        return { error: 'Employee ID or Email already exists.' };
      }
      return { error: 'Failed to update employee.' };
    }

    await createAuditLog({
      action: 'UPDATE',
      module: 'Employees',
      recordId: id,
      oldValue: oldEmp,
      newValue: { employee_code, full_name, phone, email, position, status, hire_date, notes },
      userId: profile.id
    });

    revalidatePath('/dashboard/employees');
    revalidatePath(`/dashboard/employees/${id}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

