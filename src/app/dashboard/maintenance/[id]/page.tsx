import { getMaintenanceDetails } from '../actions';
import { notFound } from 'next/navigation';
import { MaintenanceStatusBadge, MaintenancePriorityBadge } from '@/components/maintenance/maintenance-status-badge';
import { MaintenanceStatusActions } from '@/components/maintenance/maintenance-status-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, FileText, User, Wrench, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function MaintenanceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const maintenance = await getMaintenanceDetails(resolvedParams.id);

  if (!maintenance) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/maintenance">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{maintenance.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <MaintenanceStatusBadge status={maintenance.status} />
              <span className="text-muted-foreground text-sm">•</span>
              <MaintenancePriorityBadge priority={maintenance.priority} />
            </div>
          </div>
        </div>

        <MaintenanceStatusActions id={maintenance.id} currentStatus={maintenance.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Wrench className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Equipment</p>
                  <p className="text-sm text-muted-foreground">
                    {maintenance.equipment_type} 
                    {maintenance.equipment_reference && ` - ${maintenance.equipment_reference}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Estimated Cost</p>
                  <p className="text-sm font-bold text-destructive">
                    ${Number(maintenance.cost).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Description
              </h4>
              <p className="text-sm bg-muted/50 p-3 rounded-md min-h-[80px]">
                {maintenance.description}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline & People</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Start Date
                </p>
                <p className="text-sm font-medium">
                  {maintenance.start_date ? format(new Date(maintenance.start_date), 'MMM d, yyyy') : 'Not set'}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Expected
                </p>
                <p className="text-sm font-medium">
                  {maintenance.expected_completion_date ? format(new Date(maintenance.expected_completion_date), 'MMM d, yyyy') : 'Not set'}
                </p>
              </div>

              {maintenance.completed_date && (
                <div className="space-y-1 col-span-2 pt-2 border-t mt-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-emerald-500" /> Completed On
                  </p>
                  <p className="text-sm font-medium text-emerald-600">
                    {format(new Date(maintenance.completed_date), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Reported By</p>
                  <p className="text-sm text-muted-foreground">
                    {maintenance.reporter?.full_name || 'System User'}
                  </p>
                </div>
              </div>

              {maintenance.notes && (
                <div className="space-y-2 mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium">Additional Notes</h4>
                  <p className="text-sm bg-muted/50 p-3 rounded-md min-h-[60px] whitespace-pre-wrap">
                    {maintenance.notes}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
