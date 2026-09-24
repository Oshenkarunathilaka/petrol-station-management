/* eslint-disable */
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';
import { getCurrentUser, getCurrentProfile } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardNotification } from '@/types/notifications';
import { ProfileWithRole } from '@/types/auth';

interface LowStockItem {
  id: string;
  name: string;
  current_stock: number | string;
  minimum_stock: number | string;
}

interface IncidentAlert {
  id: string;
  incident_type: string;
  priority: string;
  status: string;
  location: string;
  incident_date: string;
}

interface MaintenanceAlert {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
}

async function getDashboardNotifications(
  role: ProfileWithRole['role_name'] | null
): Promise<DashboardNotification[]> {
  if (!role) return [];

  const supabase = await createClient();
  const [lowStockResult, incidentsResult, maintenanceResult] = await Promise.all([
    supabase
      .from('inventory_items')
      .select('id, name, current_stock, minimum_stock')
      .eq('status', 'ACTIVE'),
    supabase
      .from('incidents')
      .select('id, incident_type, priority, status, location, incident_date')
      .in('status', ['OPEN', 'INVESTIGATING'])
      .order('incident_date', { ascending: false }),
    supabase
      .from('maintenance')
      .select('id, title, status, priority, created_at')
      .in('status', ['PENDING', 'IN_PROGRESS'])
      .order('created_at', { ascending: false }),
  ]);

  const notifications: DashboardNotification[] = [];

  if (['ADMIN', 'MANAGER', 'SUPERVISOR'].includes(role)) {
    const lowStockItems = (lowStockResult.data ?? []) as LowStockItem[];
    for (const item of lowStockItems) {
      if (Number(item.current_stock) <= Number(item.minimum_stock)) {
        notifications.push({
          id: `low-stock-${item.id}`,
          kind: 'inventory',
          title: `Low stock: ${item.name}`,
          description: `Stock is ${Number(item.current_stock).toLocaleString()} (minimum ${Number(item.minimum_stock).toLocaleString()}).`,
          href: '/dashboard/inventory/low-stock',
        });
      }
    }
  }

  if (['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT'].includes(role)) {
    const incidents = (incidentsResult.data ?? []) as IncidentAlert[];
    for (const incident of incidents) {
      notifications.push({
        id: `incident-${incident.id}`,
        kind: 'incident',
        title: `${incident.priority.toLowerCase().replace('_', ' ')} incident: ${incident.incident_type.replaceAll('_', ' ')}`,
        description: `${incident.location} · ${incident.status.toLowerCase()}`,
        href: '/dashboard/incidents',
      });
    }
  }

  if (['ADMIN', 'MANAGER', 'SUPERVISOR', 'CASHIER', 'ATTENDANT'].includes(role)) {
    const maintenance = (maintenanceResult.data ?? []) as MaintenanceAlert[];
    for (const task of maintenance) {
      notifications.push({
        id: `maintenance-${task.id}`,
        kind: 'maintenance',
        title: `${task.priority.toLowerCase()} maintenance: ${task.title}`,
        description: `${task.status.toLowerCase().replaceAll('_', ' ')} task`,
        href: '/dashboard/maintenance',
      });
    }
  }

  return notifications;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await getCurrentProfile();
  const notifications = await getDashboardNotifications(profile?.role_name || null);

  return (
    <SidebarProvider>

      <AppSidebar userRole={profile?.role_name || null} />
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <SidebarInset>
          <Header profile={profile} notifications={notifications} />
          <main className="flex flex-1 flex-col min-w-0 p-6 bg-background">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
