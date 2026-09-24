/* eslint-disable */
import { UserRole } from '@/types/auth';
import {
  LayoutDashboard,
  Droplet,
  Container,
  Fuel,
  History,
  Truck,
  Users,
  Building2,
  Briefcase,
  CalendarDays,
  Package,
  Receipt,
  Wrench,
  AlertTriangle,
  FileBarChart,
  Settings,
  Activity,
  ClipboardList,
  User
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
  { path: '/dashboard/daily-entry', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT'] },
  { path: '/dashboard/profile', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT'] },
  
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
  { path: '/dashboard/inventory', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'] },
  { path: '/dashboard/inventory/items', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR'] },
  { path: '/dashboard/inventory/transactions', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'] },
  { path: '/dashboard/inventory/low-stock', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR'] },
  { path: '/dashboard/stock', allowedRoles: ['ADMIN', 'MANAGER'] },
  { path: '/dashboard/stock/reconciliation', allowedRoles: ['ADMIN', 'MANAGER'] },
  
  // HR & Administration
  { path: '/dashboard/employees', allowedRoles: ['ADMIN', 'MANAGER'] },
  { path: '/dashboard/shifts', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT'] },
  
  // Finances
  { path: '/dashboard/expenses', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'] },
  { path: '/dashboard/expenses/new', allowedRoles: ['ADMIN', 'MANAGER'] },
  { path: '/dashboard/expenses/[id]', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'] },
  
  // Maintenance & Issues
  { path: '/dashboard/maintenance', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT'] },
  { path: '/dashboard/incidents', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT'] },
  
  // Reporting
  { path: '/dashboard/reports', allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT'] },
  { path: '/dashboard/analytics', allowedRoles: ['ADMIN', 'MANAGER'] },
  
  // System
  { path: '/dashboard/settings', allowedRoles: ['ADMIN'] },
  { path: '/dashboard/audit-logs', allowedRoles: ['ADMIN', 'MANAGER'] }
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
    title: 'Daily Entry',
    href: '/dashboard/daily-entry',
    icon: ClipboardList,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT'],
    section: 'OPERATIONS'
  },
  {
    title: 'Fuel',
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
    title: 'Meter Readings',
    href: '/dashboard/pump-readings',
    icon: Activity,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'ATTENDANT'],
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
  {
    title: 'Stock',
    href: '/dashboard/stock',
    icon: Activity,
    allowedRoles: ['ADMIN', 'MANAGER'],
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
    icon: Building2,
    allowedRoles: ['ADMIN', 'MANAGER'],
    section: 'MANAGEMENT'
  },
  {
    title: 'Inventory',
    href: '/dashboard/inventory',
    icon: Package,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'],
    section: 'MANAGEMENT'
  },
  {
    title: 'Expenses',
    href: '/dashboard/expenses',
    icon: Receipt,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER'],
    section: 'MANAGEMENT'
  },
  {
    title: 'Maintenance',
    href: '/dashboard/maintenance',
    icon: Wrench,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT'],
    section: 'MANAGEMENT'
  },
  {
    title: 'Incidents',
    href: '/dashboard/incidents',
    icon: AlertTriangle,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT'],
    section: 'MANAGEMENT'
  },

  // ANALYTICS
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: FileBarChart,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT'],
    section: 'ANALYTICS'
  },
  {
    title: 'PDF Reports',
    href: '/dashboard/reports',
    icon: FileBarChart,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT'],
    section: 'ANALYTICS'
  },

  // SYSTEM
  {
    title: 'Users & Roles',
    href: '/dashboard/employees',
    icon: Users,
    allowedRoles: ['ADMIN'],
    section: 'SYSTEM'
  },
  {
    title: 'Station Settings',
    href: '/dashboard/settings',
    icon: Settings,
    allowedRoles: ['ADMIN'],
    section: 'SYSTEM'
  },
  {
    title: 'Audit Logs',
    href: '/dashboard/audit-logs',
    icon: Briefcase,
    allowedRoles: ['ADMIN', 'MANAGER'],
    section: 'SYSTEM'
  },
  {
    title: 'My Profile',
    href: '/dashboard/profile',
    icon: User,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT'],
    section: 'SYSTEM'
  }
];
