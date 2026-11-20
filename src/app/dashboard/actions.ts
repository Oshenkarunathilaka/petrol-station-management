'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteTransaction(transactionId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('fuel_transactions')
    .delete()
    .eq('id', transactionId)
    .select();

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data || data.length === 0) {
    return {
      success: false,
      error: 'Access denied or transaction not found. You must be an ADMIN to delete transactions.',
    };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
