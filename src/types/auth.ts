export type UserRole = 'ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'CASHIER' | 'ATTENDANT';

export interface Profile {
  id: string; // Maps to auth.users.id
  full_name: string;
  email: string | null;
  role_id: string;
  employee_id: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface ProfileWithRole extends Profile {
  role_name: UserRole;
}
