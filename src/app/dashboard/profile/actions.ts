/* eslint-disable */
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfileInfo(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const fullName = formData.get('full_name')?.toString().trim();
    const phone = formData.get('phone')?.toString().trim();
    const position = formData.get('position')?.toString().trim();

    if (!fullName) {
      return { success: false, error: 'Full name is required' };
    }

    // Update profile full_name
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        full_name: fullName,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    // Get current profile to find employee_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('employee_id')
      .eq('id', user.id)
      .single();

    if (profile?.employee_id && (phone !== undefined || position !== undefined)) {
      const updateData: Record<string, string> = {};
      if (phone !== undefined) updateData.phone = phone;
      if (position !== undefined) updateData.position = position;

      const { error: empError } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', profile.employee_id);

      if (empError) {
        console.warn('Could not update employee details:', empError.message);
      }
    }

    revalidatePath('/dashboard/profile');
    return { success: true, message: 'Profile updated successfully' };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred' };
  }
}

export async function updatePassword(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const newPassword = formData.get('new_password')?.toString();
    const confirmPassword = formData.get('confirm_password')?.toString();

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Password updated successfully' };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred' };
  }
}
