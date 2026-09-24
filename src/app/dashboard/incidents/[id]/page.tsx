/* eslint-disable */
// @ts-nocheck
import { getIncidentDetails } from '../actions';
import { getCurrentUser } from '@/lib/auth-helpers';
import { notFound } from 'next/navigation';
import { IncidentStatusBadge, IncidentPriorityBadge, formatIncidentType } from '@/components/incidents/incident-status-badge';
import { IncidentStatusActions } from '@/components/incidents/incident-status-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, FileText, User, MapPin, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function IncidentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const incident = await getIncidentDetails(resolvedParams.id);
  const user = await getCurrentUser();

  if (!incident) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/incidents">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{formatIncidentType(incident.incident_type)}</h2>
            <div className="flex items-center gap-2 mt-1">
              <IncidentStatusBadge status={incident.status} />
              <span className="text-muted-foreground text-sm">•</span>
              <IncidentPriorityBadge priority={incident.priority} />
            </div>
          </div>
        </div>

        <IncidentStatusActions id={incident.id} currentStatus={incident.status} userRole={user.role} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  {incident.location}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Description
              </h4>
              <p className="text-sm bg-muted/50 p-3 rounded-md min-h-[80px] whitespace-pre-wrap">
                {incident.description}
              </p>
            </div>

            {incident.notes && (
              <div className="space-y-2 pt-4 border-t">
                <h4 className="text-sm font-medium">Initial Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {incident.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline & Resolution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Reported On
                  </p>
                  <p className="text-sm font-medium">
                    {format(new Date(incident.incident_date), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs text-muted-foreground">Reported By</p>
                  <p className="text-sm font-medium flex items-center justify-end gap-1">
                    <User className="h-3 w-3" />
                    {incident.reporter?.full_name || 'System User'}
                  </p>
                </div>
              </div>

              {incident.resolved_date && (
                <div className="flex justify-between items-start pt-4 border-t border-muted">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-emerald-500" /> Resolved On
                    </p>
                    <p className="text-sm font-medium text-emerald-600">
                      {format(new Date(incident.resolved_date), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs text-muted-foreground">Resolved By</p>
                    <p className="text-sm font-medium flex items-center justify-end gap-1">
                      <User className="h-3 w-3 text-emerald-500" />
                      {incident.resolver?.full_name || 'Unknown'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {incident.resolution && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Resolution Details
                </h4>
                <p className="text-sm bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100 p-3 rounded-md min-h-[80px] whitespace-pre-wrap border border-emerald-100 dark:border-emerald-900/50">
                  {incident.resolution}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
