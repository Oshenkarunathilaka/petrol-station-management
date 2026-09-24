'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/lib/audit';

export async function getExpenses(from?: string, to?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('expenses')
    .select(`
      *,
      profiles:recorded_by (full_name)
    `)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (from) {
    query = query.gte('expense_date', from);
  }
  if (to) {
    query = query.lte('expense_date', to);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
  return data;
}

export async function getExpenseDetails(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      profiles:recorded_by (full_name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching expense details:', error);
    return null;
  }
  return data;
}

export async function createExpense(formData: FormData) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles(name)')
    .eq('id', userData.user.id)
    .single();

  const role = (profile?.roles as any)?.name;
  if (!['ADMIN', 'MANAGER'].includes(role)) {
    throw new Error('Insufficient permissions');
  }

  const category = formData.get('category') as string;
  const amount = Number(formData.get('amount'));
  const expense_date = formData.get('expense_date') as string;
  const description = formData.get('description') as string;
  const invoice_reference = formData.get('invoice_reference') as string;
  const notes = formData.get('notes') as string;

  if (amount <= 0) {
    return { error: 'Amount must be greater than zero.' };
  }

  const { data, error } = await supabase.from('expenses').insert({
    category,
    amount,
    expense_date,
    description,
    invoice_reference,
    notes,
    recorded_by: userData.user.id
  }).select().single();

  if (error) {
    return { error: error.message };
  }

  if (data) {
    await createAuditLog({
      action: 'CREATE',
      module: 'Expenses',
      recordId: data.id,
      newValue: data,
      userId: userData.user.id
    });
  }

  revalidatePath('/dashboard/expenses');
  return { success: true, id: data.id };
}

export async function updateExpense(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles(name)')
    .eq('id', userData.user.id)
    .single();

  const role = (profile?.roles as any)?.name;
  if (!['ADMIN', 'MANAGER'].includes(role)) {
    throw new Error('Insufficient permissions');
  }

  const category = formData.get('category') as string;
  const amount = Number(formData.get('amount'));
  const expense_date = formData.get('expense_date') as string;
  const description = formData.get('description') as string;
  const invoice_reference = formData.get('invoice_reference') as string;
  const notes = formData.get('notes') as string;

  if (amount <= 0) {
    return { error: 'Amount must be greater than zero.' };
  }

  const { data: oldExpense } = await supabase.from('expenses').select('*').eq('id', id).single();

  const { error } = await supabase.from('expenses').update({
    category,
    amount,
    expense_date,
    description,
    invoice_reference,
    notes
  }).eq('id', id);

  if (error) {
    return { error: error.message };
  }

  await createAuditLog({
    action: 'UPDATE',
    module: 'Expenses',
    recordId: id,
    oldValue: oldExpense,
    newValue: { category, amount, expense_date, description, invoice_reference, notes },
    userId: userData.user.id
  });

  revalidatePath('/dashboard/expenses');
  revalidatePath(`/dashboard/expenses/${id}`);
  return { success: true };
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles(name)')
    .eq('id', userData.user.id)
    .single();

  const role = (profile?.roles as any)?.name;
  if (!['ADMIN', 'MANAGER'].includes(role)) {
    throw new Error('Insufficient permissions');
  }

  const { data: oldExpense } = await supabase.from('expenses').select('*').eq('id', id).single();

  const { error } = await supabase.from('expenses').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  await createAuditLog({
    action: 'DELETE',
    module: 'Expenses',
    recordId: id,
    oldValue: oldExpense,
    userId: userData.user.id
  });

  revalidatePath('/dashboard/expenses');
  return { success: true };
}

