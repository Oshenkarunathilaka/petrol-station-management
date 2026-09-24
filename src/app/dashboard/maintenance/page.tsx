/* eslint-disable */
import { getMaintenanceList } from './actions';
import { MaintenanceSummary } from '@/components/maintenance/maintenance-summary';
import { MaintenanceTable } from '@/components/maintenance/maintenance-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function MaintenancePage() {
  const maintenanceList = await getMaintenanceList();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance Management</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage equipment maintenance tasks.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/maintenance/new">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Link>
        </Button>
      </div>

      <MaintenanceSummary maintenance={maintenanceList || []} />

      <MaintenanceTable maintenance={maintenanceList || []} />
    </div>
  );
}
