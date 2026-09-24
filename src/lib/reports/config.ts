import { 
  Droplet, 
  TrendingUp, 
  Fuel, 
  Users, 
  Container, 
  Activity, 
  Truck, 
  CalendarDays, 
  Wallet, 
  Package, 
  Receipt, 
  Wrench, 
  ShieldAlert 
} from 'lucide-react';

export type ReportType = 
  | 'fuel'
  | 'fuel-sales'
  | 'pump'
  | 'employee-sales'
  | 'tank-stock'
  | 'tank-variance'
  | 'delivery'
  | 'shift'
  | 'cash-reconciliation'
  | 'inventory'
  | 'expense'
  | 'maintenance'
  | 'incident';

export interface ReportConfig {
  id: ReportType;
  title: string;
  description: string;
  icon: any;
  allowedRoles: string[];
}

export const REPORT_CONFIGS: Record<ReportType, ReportConfig> = {
  'fuel': {
    id: 'fuel',
    title: 'Fuel Report',
    description: 'Aggregated fuel sales, revenue, and average prices.',
    icon: Droplet,
    allowedRoles: ['ADMIN', 'MANAGER']
  },
  'fuel-sales': {
    id: 'fuel-sales',
    title: 'Fuel Sales Report',
    description: 'Detailed transaction records for all fuel sales.',
    icon: TrendingUp,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER']
  },
  'pump': {
    id: 'pump',
    title: 'Pump Report',
    description: 'Pump and nozzle level sales and meter readings.',
    icon: Fuel,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR']
  },
  'employee-sales': {
    id: 'employee-sales',
    title: 'Employee Sales Report',
    description: 'Sales performance grouped by employee.',
    icon: Users,
    allowedRoles: ['ADMIN', 'MANAGER']
  },
  'tank-stock': {
    id: 'tank-stock',
    title: 'Tank Stock Report',
    description: 'Current tank levels, expected closing, and physical stock.',
    icon: Container,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'ATTENDANT']
  },
  'tank-variance': {
    id: 'tank-variance',
    title: 'Tank Variance Report',
    description: 'Analysis of expected vs physical stock variances.',
    icon: Activity,
    allowedRoles: ['ADMIN', 'MANAGER']
  },
  'delivery': {
    id: 'delivery',
    title: 'Fuel Delivery Report',
    description: 'Supplier fuel delivery records and costs.',
    icon: Truck,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR']
  },
  'shift': {
    id: 'shift',
    title: 'Shift Report',
    description: 'Summaries of shifts, pump assignments, and revenue.',
    icon: CalendarDays,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER']
  },
  'cash-reconciliation': {
    id: 'cash-reconciliation',
    title: 'Cash Reconciliation Report',
    description: 'Analysis of expected vs actual cash handed over.',
    icon: Wallet,
    allowedRoles: ['ADMIN', 'MANAGER']
  },
  'inventory': {
    id: 'inventory',
    title: 'Inventory Report',
    description: 'Non-fuel inventory tracking and adjustments.',
    icon: Package,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER']
  },
  'expense': {
    id: 'expense',
    title: 'Expense Report',
    description: 'Station expenses and category totals.',
    icon: Receipt,
    allowedRoles: ['ADMIN', 'MANAGER']
  },
  'maintenance': {
    id: 'maintenance',
    title: 'Maintenance Report',
    description: 'Maintenance task costs, status, and history.',
    icon: Wrench,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR']
  },
  'incident': {
    id: 'incident',
    title: 'Incident Report',
    description: 'Tracking of operational incidents and resolutions.',
    icon: ShieldAlert,
    allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR']
  }
};
