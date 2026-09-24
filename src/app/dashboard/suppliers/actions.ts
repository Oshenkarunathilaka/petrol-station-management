/* eslint-disable */
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

export async function addSupplier(formData: FormData) {
  try {
    const profile = await requireRole(['ADMIN', 'MANAGER']);
    const supabase = await createClient();

    const name = formData.get('name') as string;
    const contact_name = formData.get('contact_name') as string | null;
    const phone = formData.get('phone') as string | null;
    const email = formData.get('email') as string | null;
    const address = formData.get('address') as string | null;
    const status = formData.get('status') as string;
    const notes = formData.get('notes') as string | null;

    if (!name || !status) {
      return { error: 'Supplier Name and Status are required.' };
    }

    const { data: insertedSupplier, error } = await supabase.from('suppliers').insert({
      name,
      contact_name,
      phone,
      email,
      address,
      status,
      notes,
    }).select().single();

    if (error) {
      return { error: 'Failed to add supplier.' };
    }

    if (insertedSupplier) {
      await createAuditLog({
        action: 'CREATE',
        module: 'Suppliers',
        recordId: insertedSupplier.id,
        newValue: insertedSupplier,
        userId: profile.id
      });
    }

    revalidatePath('/dashboard/suppliers');
    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'An error occurred' };
  }
}

export async function updateSupplier(id: string, formData: FormData) {
  try {
    const profile = await requireRole(['ADMIN', 'MANAGER']);
    const supabase = await createClient();

    const name = formData.get('name') as string;
    const contact_name = formData.get('contact_name') as string | null;
    const phone = formData.get('phone') as string | null;
    const email = formData.get('email') as string | null;
    const address = formData.get('address') as string | null;
    const status = formData.get('status') as string;
    const notes = formData.get('notes') as string | null;

    if (!name || !status) {
      return { error: 'Supplier Name and Status are required.' };
    }

    const { data: oldSupplier } = await supabase.from('suppliers').select('*').eq('id', id).single();

    const { error } = await supabase.from('suppliers').update({
      name,
      contact_name,
      phone,
      email,
      address,
      status,
      notes,
    }).eq('id', id);

    if (error) {
      return { error: 'Failed to update supplier.' };
    }

    await createAuditLog({
      action: 'UPDATE',
      module: 'Suppliers',
      recordId: id,
      oldValue: oldSupplier,
      newValue: { name, contact_name, phone, email, address, status, notes },
      userId: profile.id
    });

    revalidatePath('/dashboard/suppliers');
    revalidatePath(`/dashboard/suppliers/${id}`);
    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'An error occurred' };
  }
}

