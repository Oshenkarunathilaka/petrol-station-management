'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getCurrentProfile } from '@/lib/auth-helpers';

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

  const { error } = await supabase.from('fuel_types').insert({
    name,
    code,
    description,
    status: status || 'ACTIVE',
  });

  if (error) {
    if (error.code === '23505') { // Unique violation
      return { error: 'A fuel type with this Name or Code already exists.' };
    }
    return { error: error.message };
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

  // 1. Check for the currently active price for this fuel type
  // A price is "active" if effective_from <= NOW and (effective_until IS NULL OR effective_until > NOW)
  // Or simply, we just find any price where effective_until is null (meaning it's the latest indefinite price)
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

    // Prevent overlapping past
    if (newEffectiveFrom <= currentEffectiveFrom) {
      return { error: 'New price effective date must be strictly after the current price effective date.' };
    }

    // 2. Update the old price to end when the new price begins
    const { error: updateError } = await supabase
      .from('fuel_prices')
      .update({ effective_until: effective_from })
      .eq('id', currentPrice.id);

    if (updateError) {
      return { error: `Failed to update previous price: ${updateError.message}` };
    }
  }

  // 3. Insert the new price
  const { error: insertError } = await supabase
    .from('fuel_prices')
    .insert({
      fuel_type_id,
      price_per_liter,
      effective_from,
      effective_until,
      created_by: profile.id,
    });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath('/dashboard/fuel/prices');
  return { success: true };
}
