import { getCurrentProfile, requirePermission } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { ProfileClient } from './ProfileClient';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  await requirePermission('/dashboard/profile');
  
  const profile = await getCurrentProfile();
  
  let employeeData = null;
  if (profile?.employee_id) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('employees')
      .select('*')
      .eq('id', profile.employee_id)
      .single();
    employeeData = data;
  }

  return <ProfileClient profile={profile} employeeData={employeeData} />;
}
