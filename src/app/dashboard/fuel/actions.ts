/* eslint-disable */
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getCurrentProfile } from '@/lib/auth-helpers';
import { createAuditLog } from '@/lib/audit';

export async function addFuelType(formData: FormData) {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  
  if (!profile || !['ADMIN', 'MANAGER'].includes(profile.role_name || '')) {
    return { error: 'Unauthorized to add fuel types.' };
  }

  const name = formData.get('name') as string;
  const code = formData.get('code') as string;
  const description = formData.get('description') as string;
  const status = formData.get('status') as string;

  if (!name || !code) {
    return { error: 'Name and Code are required.' };
  }

  const { data: insertedFuel, error } = await supabase.from('fuel_types').insert({
    name,
    code,
    description,
    status: status || 'ACTIVE',
  }).select().single();

  if (error) {
    if (error.code === '23505') { // Unique violation
      return { error: 'A fuel type with this Name or Code already exists.' };
    }
    return { error: error.message };
  }

  if (insertedFuel) {
    await createAuditLog({
      action: 'CREATE',
      module: 'Fuel',
      recordId: insertedFuel.id,
      newValue: insertedFuel,
      userId: profile.id
    });
  }

  revalidatePath('/dashboard/fuel/types');
  return { success: true };
}

export async function toggleFuelTypeStatus(id: string, currentStatus: string) {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  
  if (!profile || !['ADMIN', 'MANAGER'].includes(profile.role_name || '')) {
    return { error: 'Unauthorized to update fuel types.' };
  }

  const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

  const { error } = await supabase
    .from('fuel_types')
    .update({ status: newStatus })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  await createAuditLog({
    action: 'STATUS_CHANGE',
    module: 'Fuel',
    recordId: id,
    oldValue: { status: currentStatus },
    newValue: { status: newStatus },
    userId: profile.id
  });

  revalidatePath('/dashboard/fuel/types');
  return { success: true };
}

export async function addFuelPrice(formData: FormData) {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  
  if (!profile || !['ADMIN', 'MANAGER'].includes(profile.role_name || '')) {
    return { error: 'Unauthorized to add fuel prices.' };
  }

  const fuel_type_id = formData.get('fuel_type_id') as string;
  const price_per_liter = parseFloat(formData.get('price_per_liter') as string);
  const effective_from = formData.get('effective_from') as string;
  const effective_until = formData.get('effective_until') as string || null;

  if (!fuel_type_id || isNaN(price_per_liter) || !effective_from) {
    return { error: 'Fuel Type, Price, and Effective From date are required.' };
  }

  if (price_per_liter < 0) {
    return { error: 'Price must be greater than or equal to zero.' };
  }

  const { data: currentPrices, error: currentError } = await supabase
    .from('fuel_prices')
    .select('*')
    .eq('fuel_type_id', fuel_type_id)
    .is('effective_until', null)
    .order('effective_from', { ascending: false });

  if (currentError) {
    return { error: currentError.message };
  }

  if (currentPrices && currentPrices.length > 0) {
    const currentPrice = currentPrices[0];
    
    const currentEffectiveFrom = new Date(currentPrice.effective_from).getTime();
    const newEffectiveFrom = new Date(effective_from).getTime();

    if (newEffectiveFrom <= currentEffectiveFrom) {
      return { error: 'New price effective date must be strictly after the current price effective date.' };
    }

    const { error: updateError } = await supabase
      .from('fuel_prices')
      .update({ effective_until: effective_from })
      .eq('id', currentPrice.id);

    if (updateError) {
      return { error: `Failed to update previous price: ${updateError.message}` };
    }
  }

  const { data: insertedPrice, error: insertError } = await supabase
    .from('fuel_prices')
    .insert({
      fuel_type_id,
      price_per_liter,
      effective_from,
      effective_until,
      created_by: profile.id,
    })
    .select()
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  if (insertedPrice) {
    await createAuditLog({
      action: 'UPDATE',
      module: 'Fuel Prices',
      recordId: insertedPrice.id,
      newValue: insertedPrice,
      userId: profile.id
    });
  }

  revalidatePath('/dashboard/fuel/prices');
  return { success: true };
}

