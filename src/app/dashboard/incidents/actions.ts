'use server';

import { createClient } from '@/lib/supabase/server';
import { requirePermission, getCurrentProfile } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/lib/audit';

export async function getIncidents() {
  await requirePermission('/dashboard/incidents');
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('incidents')
    .select(`
      *,
      reporter:profiles!incidents_reported_by_fkey(id, full_name, role_name),
      resolver:profiles!incidents_resolved_by_fkey(id, full_name, role_name)
    `)
    .order('incident_date', { ascending: false });

  if (error) {
    console.error('Error fetching incidents:', error);
    return [];
  }
  return data;
}

export async function getIncidentDetails(id: string) {
  await requirePermission('/dashboard/incidents');
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('incidents')
    .select(`
      *,
      reporter:profiles!incidents_reported_by_fkey(id, full_name, email, role_name),
      resolver:profiles!incidents_resolved_by_fkey(id, full_name, email, role_name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching incident detail:', error);
    return null;
  }
  
  return data;
}

export async function createIncident(data: any) {
  await requirePermission('/dashboard/incidents');
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: inserted, error } = await supabase
    .from('incidents')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error creating incident:', error);
    return { error: error.message };
  }

  if (inserted) {
    await createAuditLog({
      action: 'CREATE',
      module: 'Incidents',
      recordId: inserted.id,
      newValue: inserted,
      userId: profile?.id
    });
  }

  revalidatePath('/dashboard/incidents');
  return { success: true };
}

export async function updateIncidentStatus(id: string, newStatus: string, resolution?: string) {
  await requirePermission('/dashboard/incidents');
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  
  const { data: current, error: fetchErr } = await supabase
    .from('incidents')
    .select('*')
    .eq('id', id)
    .single();
    
  if (fetchErr || !current) return { error: 'Record not found' };
  
  const currentStatus = current.status;
  let isValid = false;
  
  if (currentStatus === 'OPEN' && newStatus === 'INVESTIGATING') isValid = true;
  if (currentStatus === 'INVESTIGATING' && newStatus === 'RESOLVED') isValid = true;
  if (currentStatus === 'RESOLVED' && newStatus === 'CLOSED') isValid = true;
  
  if (profile && ['ADMIN', 'MANAGER'].includes(profile.role_name)) {
    if (currentStatus === 'OPEN' && newStatus === 'CLOSED') isValid = true;
  }
  
  if (!isValid) {
    return { error: `Invalid transition from ${currentStatus} to ${newStatus}` };
  }
  
  if (['RESOLVED', 'CLOSED'].includes(newStatus) && !resolution) {
     return { error: `A resolution must be provided to move to ${newStatus}` };
  }

  const updateData: any = { status: newStatus };
  
  if (['RESOLVED', 'CLOSED'].includes(newStatus)) {
    updateData.resolution = resolution;
    updateData.resolved_by = profile?.id || null;
    updateData.resolved_date = new Date().toISOString();
  }

  const { error } = await supabase
    .from('incidents')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating status:', error);
    return { error: error.message };
  }

  await createAuditLog({
    action: 'STATUS_CHANGE',
    module: 'Incidents',
    recordId: id,
    oldValue: current,
    newValue: updateData,
    userId: profile?.id
  });

  revalidatePath('/dashboard/incidents');
  revalidatePath(`/dashboard/incidents/${id}`);
  return { success: true };
}

