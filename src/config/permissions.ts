import { UserRole } from '@/types/auth';
import {
  LayoutDashboard,
  Droplet,
  Container,
  Fuel,
  History,
  Truck,
  Users,
  Briefcase,
  CalendarDays,
  Package,
  Receipt,
  Wrench,
  AlertTriangle,
  FileBarChart,
  Settings,
  Activity
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export type RoutePermission = {
  path: string;
  allowedRoles: UserRole[];
};

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  allowedRoles: UserRole[];
  section: 'OPERATIONS' | 'MANAGEMENT' | 'ANALYTICS' | 'SYSTEM';
};

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  { path: '/dashboard', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT'] },
  
  // Fuel Management & Infrastructure
  { path: '/dashboard/fuel', allowedRoles: ['ADMIN', 'MANAGER'] },
  { path: '/dashboard/tanks', allowedRoles: ['ADMIN', 'MANAGER'] },
  { path: '/dashboard/pumps', allowedRoles: ['ADMIN', 'MANAGER'] },
  { path: '/dashboard/fuel-prices', allowedRoles: ['ADMIN', 'MANAGER'] },
  
  // Operations
  { path: '/dashboard/tanks/readings', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR'] },
  { path: '/dashboard/tanks/calibrations', allowedRoles: ['ADMIN', 'MANAGER'] },
  { path: '/dashboard/pump-readings', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'ATTENDANT'] },
  { path: '/dashboard/pump-assignments', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR'] },
  
  // Sales & Transactions
  { path: '/dashboard/transactions', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'] },
  { path: '/dashboard/payments', allowedRoles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  
  // Logistics & Inventory
  { path: '/dashboard/deliveries', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR'] },
  { path: '/dashboard/suppliers', allowedRoles: ['ADMIN', 'MANAGER'] },
  { path: '/dashboard/inventory', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR'] },
  
  // HR & Administration
  { path: '/dashboard/employees', allowedRoles: ['ADMIN', 'MANAGER'] },
  { path: '/dashboard/shifts', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT'] },
  
  // Finances
  { path: '/dashboard/expenses', allowedRoles: ['ADMIN', 'MANAGER'] },
  
  // Maintenance & Issues
  { path: '/dashboard/maintenance', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR'] },
  { path: '/dashboard/incidents', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR'] },
  
  // Reporting
  { path: '/dashboard/reports', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'] },
  
  // System
  { path: '/dashboard/settings', allowedRoles: ['ADMIN'] },
  { path: '/dashboard/audit-logs', allowedRoles: ['ADMIN'] }
];

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  // OPERATIONS
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT'],
    section: 'OPERATIONS'
  },
  {
    title: 'Fuel Types',
    href: '/dashboard/fuel',
    icon: Droplet,
    allowedRoles: ['ADMIN', 'MANAGER'],
    section: 'OPERATIONS'
  },
  {
    title: 'Tanks',
    href: '/dashboard/tanks',
    icon: Container,
    allowedRoles: ['ADMIN', 'MANAGER'],
    section: 'OPERATIONS'
  },
  {
    title: 'Calibrations',
    href: '/dashboard/tanks/calibrations',
    icon: Container,
    allowedRoles: ['ADMIN', 'MANAGER'],
    section: 'OPERATIONS'
  },
  {
    title: 'Tank Readings',
    href: '/dashboard/tanks/readings',
    icon: History,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
    section: 'OPERATIONS'
  },
  {
    title: 'Pumps',
    href: '/dashboard/pumps',
    icon: Fuel,
    allowedRoles: ['ADMIN', 'MANAGER'],
    section: 'OPERATIONS'
  },
  {
    title: 'Transactions',
    href: '/dashboard/transactions',
    icon: History,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'],
    section: 'OPERATIONS'
  },
  {
    title: 'Deliveries',
    href: '/dashboard/deliveries',
    icon: Truck,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
    section: 'OPERATIONS'
  },
  {
    title: 'Shifts',
    href: '/dashboard/shifts',
    icon: CalendarDays,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT'],
    section: 'OPERATIONS'
  },

  // MANAGEMENT
  {
    title: 'Employees',
    href: '/dashboard/employees',
    icon: Users,
    allowedRoles: ['ADMIN', 'MANAGER'],
    section: 'MANAGEMENT'
  },
  {
    title: 'Suppliers',
    href: '/dashboard/suppliers',
    icon: Users, // Can change icon later if needed
    allowedRoles: ['ADMIN', 'MANAGER'],
    section: 'MANAGEMENT'
  },
  {
    title: 'Inventory',
    href: '/dashboard/inventory',
    icon: Package,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
    section: 'MANAGEMENT'
  },
  {
    title: 'Expenses',
    href: '/dashboard/expenses',
    icon: Receipt,
    allowedRoles: ['ADMIN', 'MANAGER'],
    section: 'MANAGEMENT'
  },
  {
    title: 'Maintenance',
    href: '/dashboard/maintenance',
    icon: Wrench,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
    section: 'MANAGEMENT'
  },
  {
    title: 'Incidents',
    href: '/dashboard/incidents',
    icon: AlertTriangle,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
    section: 'MANAGEMENT'
  },

  // ANALYTICS
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: FileBarChart,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'],
    section: 'ANALYTICS'
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: Activity,
    allowedRoles: ['ADMIN', 'MANAGER'],
    section: 'ANALYTICS'
  },

  // SYSTEM
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    allowedRoles: ['ADMIN'],
    section: 'SYSTEM'
  },
  {
    title: 'Audit Logs',
    href: '/dashboard/audit-logs',
    icon: Briefcase,
    allowedRoles: ['ADMIN'],
    section: 'SYSTEM'
  }
];
