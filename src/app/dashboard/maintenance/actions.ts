/* eslint-disable */
'use server';

import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/lib/audit';

export async function getMaintenanceList() {
  await requirePermission('/dashboard/maintenance');
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('maintenance')
    .select(`
      *,
      reporter:profiles!maintenance_reported_by_fkey(id, full_name, role_name),
      assignee:profiles!maintenance_assigned_to_fkey(id, full_name, role_name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching maintenance:', error);
    return [];
  }
  return data;
}

export async function getMaintenanceDetails(id: string) {
  await requirePermission('/dashboard/maintenance');
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('maintenance')
    .select(`
      *,
      reporter:profiles!maintenance_reported_by_fkey(id, full_name, email, role_name),
      assignee:profiles!maintenance_assigned_to_fkey(id, full_name, email, role_name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching maintenance detail:', error);
    return null;
  }
  
  return data;
}

export async function createMaintenance(data: any) {
  await requirePermission('/dashboard/maintenance');
  const supabase = await createClient();

  if (data.expected_completion_date && data.start_date) {
    const start = new Date(data.start_date);
    const end = new Date(data.expected_completion_date);
    if (end < start) {
      return { error: 'Completion date cannot be before start date' };
    }
  }

  const { data: inserted, error } = await supabase
    .from('maintenance')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error creating maintenance:', error);
    return { error: error.message };
  }

  if (inserted) {
    await createAuditLog({
      action: 'CREATE',
      module: 'Maintenance',
      recordId: inserted.id,
      newValue: inserted
    });
  }

  revalidatePath('/dashboard/maintenance');
  return { success: true };
}

export async function updateMaintenanceStatus(id: string, newStatus: string) {
  await requirePermission('/dashboard/maintenance');
  const supabase = await createClient();
  
  const { data: current, error: fetchErr } = await supabase
    .from('maintenance')
    .select('*')
    .eq('id', id)
    .single();
    
  if (fetchErr || !current) return { error: 'Record not found' };
  
  const currentStatus = current.status;
  let isValid = false;
  
  if (currentStatus === 'PENDING' && ['IN_PROGRESS', 'CANCELLED'].includes(newStatus)) isValid = true;
  if (currentStatus === 'IN_PROGRESS' && ['COMPLETED', 'CANCELLED'].includes(newStatus)) isValid = true;
  
  if (!isValid) {
    return { error: `Invalid transition from ${currentStatus} to ${newStatus}` };
  }

  const updateData: any = { status: newStatus };
  if (newStatus === 'COMPLETED') {
    updateData.completed_date = new Date().toISOString().split('T')[0];
  }

  const { error } = await supabase
    .from('maintenance')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating status:', error);
    return { error: error.message };
  }

  await createAuditLog({
    action: 'STATUS_CHANGE',
    module: 'Maintenance',
    recordId: id,
    oldValue: current,
    newValue: updateData
  });

  revalidatePath('/dashboard/maintenance');
  revalidatePath(`/dashboard/maintenance/${id}`);
  return { success: true };
}

