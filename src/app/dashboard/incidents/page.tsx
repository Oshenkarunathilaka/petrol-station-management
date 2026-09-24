import { getIncidents } from './actions';
import { IncidentSummary } from '@/components/incidents/incident-summary';
import { IncidentTable } from '@/components/incidents/incident-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function IncidentsPage() {
  const incidentList = await getIncidents();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incident Management</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage operational incidents and issues.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/incidents/new">
            <Plus className="w-4 h-4 mr-2" />
            Report Incident
          </Link>
        </Button>
      </div>

      <IncidentSummary incidents={incidentList || []} />

      <IncidentTable incidents={incidentList || []} />
    </div>
  );
}
