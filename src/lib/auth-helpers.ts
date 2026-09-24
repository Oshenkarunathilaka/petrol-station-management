/* eslint-disable */
import { createClient } from '@/lib/supabase/server';
import { UserRole, ProfileWithRole } from '@/types/auth';
import { ROUTE_PERMISSIONS } from '@/config/permissions';
import { redirect } from 'next/navigation';

/**
 * Gets the current authenticated user from Supabase.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Gets the current user's profile joined with their role.
 */
export async function getCurrentProfile(): Promise<ProfileWithRole | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  
  // Note: We expect the roles table to have a "name" column.
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      roles:role_id (
        name
      )
    `)
    .eq('id', user.id)
    .single();

  if (error || !data) {
    console.error('Error fetching profile with role:', error?.message);
    return null;
  }

  // Flatten the role name into the profile object
  const profileWithRole: ProfileWithRole = {
    ...data,
    role_name: (data.roles as unknown as { name: string })?.name as UserRole
  };

  return profileWithRole;
}

/**
 * Gets just the current user's role.
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const profile = await getCurrentProfile();
  return profile?.role_name || null;
}

/**
 * Checks if the given role matches the expected role.
 */
export function hasRole(role: UserRole | null, expectedRole: UserRole): boolean {
  return role === expectedRole;
}

/**
 * Checks if the given role is included in a list of allowed roles.
 */
export function hasAnyRole(role: UserRole | null, allowedRoles: UserRole[]): boolean {
  if (!role) return false;
  return allowedRoles.includes(role);
}

/**
 * Checks if a given role is allowed to access a given route based on ROUTE_PERMISSIONS.
 */
export function canAccess(role: UserRole | null, path: string): boolean {
  if (!role) return false;

  // Find the exact route match, or fallback to checking parent routes if applicable
  // For exact match:
  const permission = ROUTE_PERMISSIONS.find(p => p.path === path);
  
  if (permission) {
    return permission.allowedRoles.includes(role);
  }

  // If no explicit permission is found for this path, fail secure (deny access)
  // Or check if a parent route explicitly allows/denies.
  // For now, if it's not defined, we deny.
  return false;
}

/**
 * Helper to be used in Server Components to protect a route.
 * Redirects to /login if unauthenticated, or /unauthorized if unauthorized.
 */
export async function requirePermission(path: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const role = await getCurrentUserRole();
  if (!role || !canAccess(role, path)) {
    redirect('/unauthorized');
  }
  
  return { user, role };
}
