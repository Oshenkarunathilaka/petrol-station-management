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

export async function createDelivery(formData: FormData) {
  try {
    const profile = await requireRole(['ADMIN', 'MANAGER', 'SUPERVISOR']);
    const supabase = await createClient();

    const supplier_id = formData.get('supplier_id') as string;
    const fuel_type_id = formData.get('fuel_type_id') as string;
    const tank_id = formData.get('tank_id') as string;
    const quantity_liters = parseFloat(formData.get('quantity_liters') as string);
    const purchase_price = parseFloat(formData.get('purchase_price') as string);
    const invoice_number = formData.get('invoice_number') as string | null;
    const reference = formData.get('reference') as string | null;
    const delivery_date_str = formData.get('delivery_date') as string;
    const delivery_time_str = formData.get('delivery_time') as string;
    const received_by = formData.get('received_by') as string | null;
    const notes = formData.get('notes') as string | null;
    const status = (formData.get('status') as string) || 'PENDING';

    if (!supplier_id || !fuel_type_id || !tank_id || isNaN(quantity_liters) || isNaN(purchase_price) || !delivery_date_str || !delivery_time_str) {
      return { error: 'Supplier, Fuel Type, Tank, Quantity, Purchase Price, Delivery Date, and Delivery Time are required.' };
    }

    if (quantity_liters <= 0) {
      return { error: 'Quantity must be greater than zero.' };
    }

    if (purchase_price < 0) {
      return { error: 'Purchase price must be greater than or equal to zero.' };
    }

    const { data: supplier } = await supabase
      .from('suppliers')
      .select('id')
      .eq('id', supplier_id)
      .single();

    if (!supplier) {
      return { error: 'Selected Supplier does not exist.' };
    }

    const { data: fuelType } = await supabase
      .from('fuel_types')
      .select('id, name')
      .eq('id', fuel_type_id)
      .single();

    if (!fuelType) {
      return { error: 'Selected Fuel Type does not exist.' };
    }

    const { data: tank } = await supabase
      .from('tanks')
      .select('id, tank_number, fuel_type_id, fuel_types(name)')
      .eq('id', tank_id)
      .single();

    if (!tank) {
      return { error: 'Selected Tank does not exist.' };
    }

    if (tank.fuel_type_id !== fuel_type_id) {
      const fuelTypesData = tank.fuel_types as { name?: string } | null;
      const tankFuelName = fuelTypesData?.name || 'another fuel type';
      return {
        error: `Cannot deliver ${fuelType.name} into Tank ${tank.tank_number}, which is configured for ${tankFuelName}.`,
      };
    }

    if (received_by) {
      const { data: emp } = await supabase
        .from('employees')
        .select('id')
        .eq('id', received_by)
        .single();

      if (!emp) {
        return { error: 'Selected receiving employee does not exist.' };
      }
    }

    const delivery_date = new Date(`${delivery_date_str}T${delivery_time_str}`).toISOString();

    const { data: newDelivery, error: insertError } = await supabase
      .from('fuel_deliveries')
      .insert({
        supplier_id,
        fuel_type_id,
        tank_id,
        quantity_liters,
        purchase_price,
        invoice_number,
        reference,
        delivery_date,
        received_by: received_by || null,
        status,
        notes,
      })
      .select()
      .single();

    if (insertError) {
      return { error: insertError.message || 'Failed to record delivery.' };
    }

    if (newDelivery) {
      await createAuditLog({
        action: 'CREATE',
        module: 'Deliveries',
        recordId: newDelivery.id,
        newValue: newDelivery,
        userId: profile.id
      });
    }

    revalidatePath('/dashboard/deliveries');
    revalidatePath('/dashboard/tanks');
    revalidatePath(`/dashboard/tanks/${tank_id}`);

    return { success: true, deliveryId: newDelivery.id };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'An error occurred' };
  }
}

export async function confirmDelivery(deliveryId: string) {
  try {
    const profile = await requireRole(['ADMIN', 'MANAGER', 'SUPERVISOR']);
    const supabase = await createClient();

    const { data: delivery, error: fetchError } = await supabase
      .from('fuel_deliveries')
      .select('id, status, tank_id')
      .eq('id', deliveryId)
      .single();

    if (fetchError || !delivery) {
      return { error: 'Delivery record not found.' };
    }

    if (delivery.status === 'CONFIRMED' || delivery.status === 'COMPLETED') {
      return { error: 'Delivery has already been confirmed.' };
    }

    if (delivery.status === 'CANCELLED') {
      return { error: 'Cannot confirm a cancelled delivery.' };
    }

    const { error: updateError } = await supabase
      .from('fuel_deliveries')
      .update({ status: 'CONFIRMED' })
      .eq('id', deliveryId);

    if (updateError) {
      return { error: 'Failed to confirm delivery.' };
    }

    await createAuditLog({
      action: 'CONFIRM',
      module: 'Deliveries',
      recordId: deliveryId,
      oldValue: { status: delivery.status },
      newValue: { status: 'CONFIRMED' },
      userId: profile.id
    });

    revalidatePath('/dashboard/deliveries');
    revalidatePath(`/dashboard/deliveries/${deliveryId}`);
    revalidatePath('/dashboard/tanks');
    revalidatePath(`/dashboard/tanks/${delivery.tank_id}`);

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function cancelDelivery(deliveryId: string) {
  try {
    const profile = await requireRole(['ADMIN', 'MANAGER']);
    const supabase = await createClient();

    const { data: delivery, error: fetchError } = await supabase
      .from('fuel_deliveries')
      .select('id, status, tank_id')
      .eq('id', deliveryId)
      .single();

    if (fetchError || !delivery) {
      return { error: 'Delivery record not found.' };
    }

    const { error: updateError } = await supabase
      .from('fuel_deliveries')
      .update({ status: 'CANCELLED' })
      .eq('id', deliveryId);

    if (updateError) {
      return { error: 'Failed to cancel delivery.' };
    }

    await createAuditLog({
      action: 'CANCEL',
      module: 'Deliveries',
      recordId: deliveryId,
      oldValue: { status: delivery.status },
      newValue: { status: 'CANCELLED' },
      userId: profile.id
    });

    revalidatePath('/dashboard/deliveries');
    revalidatePath(`/dashboard/deliveries/${deliveryId}`);
    revalidatePath('/dashboard/tanks');
    revalidatePath(`/dashboard/tanks/${delivery.tank_id}`);

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

