/* eslint-disable */
'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/lib/audit';

export async function getInventoryItems() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching inventory items:', error);
    return [];
  }
  return data;
}

export async function getInventoryItemDetails(id: string) {
  const supabase = await createClient();
  const { data: item, error: itemError } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('id', id)
    .single();

  if (itemError) {
    console.error('Error fetching item:', itemError);
    return null;
  }

  const { data: transactions, error: txError } = await supabase
    .from('inventory_transactions')
    .select(`
      *,
      profiles:created_by (full_name)
    `)
    .eq('inventory_item_id', id)
    .order('created_at', { ascending: false });

  if (txError) {
    console.error('Error fetching item transactions:', txError);
  }

  return { item, transactions: transactions || [] };
}

export async function addInventoryItem(formData: FormData) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles(name)')
    .eq('id', userData.user.id)
    .single();

  const role = (profile?.roles as any)?.name;
  if (!['ADMIN', 'MANAGER', 'SUPERVISOR'].includes(role)) {
    throw new Error('Insufficient permissions');
  }

  const item_code = formData.get('item_code') as string;
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const unit = formData.get('unit') as string;
  const minimum_stock = Number(formData.get('minimum_stock'));
  const selling_price = Number(formData.get('selling_price'));
  const cost_price = Number(formData.get('cost_price'));
  const description = formData.get('description') as string;

  const { data: newItem, error } = await supabase.from('inventory_items').insert({
    item_code,
    name,
    category,
    unit,
    minimum_stock,
    selling_price,
    cost_price,
    description,
    current_stock: 0,
    status: 'ACTIVE'
  }).select().single();

  if (error) {
    return { error: error.message };
  }

  if (newItem) {
    await createAuditLog({
      action: 'CREATE',
      module: 'Inventory',
      recordId: newItem.id,
      newValue: newItem,
      userId: userData.user.id
    });
  }

  revalidatePath('/dashboard/inventory/items');
  return { success: true };
}

export async function updateInventoryItem(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles(name)')
    .eq('id', userData.user.id)
    .single();

  const role = (profile?.roles as any)?.name;
  if (!['ADMIN', 'MANAGER', 'SUPERVISOR'].includes(role)) {
    throw new Error('Insufficient permissions');
  }

  const item_code = formData.get('item_code') as string;
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const unit = formData.get('unit') as string;
  const minimum_stock = Number(formData.get('minimum_stock'));
  const selling_price = Number(formData.get('selling_price'));
  const cost_price = Number(formData.get('cost_price'));
  const status = formData.get('status') as string;
  const description = formData.get('description') as string;

  const { data: oldItem } = await supabase.from('inventory_items').select('*').eq('id', id).single();

  const { error } = await supabase.from('inventory_items').update({
    item_code,
    name,
    category,
    unit,
    minimum_stock,
    selling_price,
    cost_price,
    status,
    description
  }).eq('id', id);

  if (error) {
    return { error: error.message };
  }

  await createAuditLog({
    action: 'UPDATE',
    module: 'Inventory',
    recordId: id,
    oldValue: oldItem,
    newValue: { item_code, name, category, unit, minimum_stock, selling_price, cost_price, status, description },
    userId: userData.user.id
  });

  revalidatePath('/dashboard/inventory/items');
  revalidatePath(`/dashboard/inventory/items/${id}`);
  return { success: true };
}

export async function getInventoryTransactions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('inventory_transactions')
    .select(`
      *,
      inventory_items (name, item_code, category),
      profiles:created_by (full_name)
    `)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  return data;
}

export async function addInventoryTransaction(formData: FormData) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('Unauthorized');

  const inventory_item_id = formData.get('inventory_item_id') as string;
  const transaction_type = formData.get('transaction_type') as string;
  const quantity = Number(formData.get('quantity'));
  const reference = formData.get('reference') as string;
  const notes = formData.get('notes') as string;

  if (quantity < 0 && transaction_type !== 'ADJUSTMENT') {
    return { error: 'Quantity cannot be negative' };
  }

  const { data: newTx, error } = await supabase.from('inventory_transactions').insert({
    inventory_item_id,
    transaction_type,
    quantity,
    reference,
    notes,
    created_by: userData.user.id
  }).select().single();

  if (error) {
    return { error: error.message };
  }

  if (newTx) {
    await createAuditLog({
      action: 'UPDATE',
      module: 'Inventory',
      recordId: newTx.id,
      newValue: newTx,
      userId: userData.user.id
    });
  }

  revalidatePath('/dashboard/inventory/items');
  revalidatePath('/dashboard/inventory/transactions');
  revalidatePath('/dashboard/inventory/low-stock');
  if (inventory_item_id) {
    revalidatePath(`/dashboard/inventory/items/${inventory_item_id}`);
  }
  return { success: true };
}

export async function getLowStockItems() {
  const supabase = await createClient();
  const { data: allItems, error: allError } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('status', 'ACTIVE');
    
  if (allError) {
    return [];
  }
  
  return allItems.filter((item: any) => item.current_stock <= item.minimum_stock);
}

