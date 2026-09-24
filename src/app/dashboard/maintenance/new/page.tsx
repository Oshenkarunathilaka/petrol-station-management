/* eslint-disable */
// @ts-nocheck
import { getCurrentUser } from '@/lib/auth-helpers';
import { MaintenanceForm } from '@/components/maintenance/maintenance-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewMaintenancePage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/maintenance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Report Maintenance</h2>
          <p className="text-muted-foreground">
            Create a new maintenance task or issue report.
          </p>
        </div>
      </div>

      <MaintenanceForm userId={user.id} />
    </div>
  );
}
