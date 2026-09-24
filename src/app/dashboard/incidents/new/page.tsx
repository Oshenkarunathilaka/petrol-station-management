/* eslint-disable */
// @ts-nocheck
import { getCurrentUser } from '@/lib/auth-helpers';
import { IncidentForm } from '@/components/incidents/incident-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewIncidentPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/incidents">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Report Incident</h2>
          <p className="text-muted-foreground">
            Create a new operational incident report.
          </p>
        </div>
      </div>

      <IncidentForm userId={user.id} />
    </div>
  );
}
