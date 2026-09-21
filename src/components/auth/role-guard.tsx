'use client';

import { ReactNode } from 'react';
import { UserRole } from '@/types/auth';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  userRole: UserRole | null | undefined;
  fallback?: ReactNode;
}

/**
 * A UI helper component to conditionally render children based on the user's role.
 * Best used in Client Components or when you pass the userRole down from a Server Component.
 */
export function RoleGuard({ children, allowedRoles, userRole, fallback = null }: RoleGuardProps) {
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
