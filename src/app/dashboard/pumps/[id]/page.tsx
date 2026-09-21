import { requirePermission } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fuel, Users, History } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { NozzleForm } from '@/components/pumps/nozzle-form';
import { Button } from '@/components/ui/button';
import { deleteNozzle } from '@/app/dashboard/pumps/actions';
import { Trash2 } from 'lucide-react';

export const metadata = {
  title: 'Pump Details | Management System',
};

export default async function PumpDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission('/dashboard/pumps');
  const { id } = await params;
  
  const supabase = await createClient();

  // Fetch pump details
  const { data: pump, error } = await supabase
    .from('pumps')
    .select(`
      *,
      pump_nozzles (
        id,
        nozzle_number,
        status,
        fuel_types (id, name, code)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !pump) {
    notFound();
  }

  // Fetch all fuel types for the nozzle form
  const { data: fuelTypes } = await supabase
    .from('fuel_types')
    .select('id, name, code')
    .eq('status', 'ACTIVE')
    .order('name');

  // Fetch active assignments for this pump
  const { data: assignments } = await supabase
    .from('pump_assignments')
    .select(`
      id,
      assigned_from,
      assigned_until,
      status,
      employees (full_name),
      shifts (name)
    `)
    .eq('pump_id', id)
    .eq('status', 'ACTIVE')
    .order('assigned_from', { ascending: false });

  // Fetch recent readings for nozzles of this pump
  const nozzleIds = pump.pump_nozzles.map((n: any) => n.id);
  let recentReadings: any[] = [];
  if (nozzleIds.length > 0) {
    const { data } = await supabase
      .from('pump_readings')
      .select(`
        id,
        reading_date,
        reading_time,
        previous_meter,
        current_meter,
        fuel_sold_liters,
        pump_nozzles (nozzle_number)
      `)
      .in('nozzle_id', nozzleIds)
      .order('reading_date', { ascending: false })
      .order('reading_time', { ascending: false })
      .limit(5);
    recentReadings = data || [];
  }

  // Sort nozzles
  const sortedNozzles = [...(pump.pump_nozzles || [])].sort((a, b) => a.nozzle_number - b.nozzle_number);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-full">
            <Fuel className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{pump.pump_number}</h1>
            <p className="text-muted-foreground mt-1">
              {pump.location || 'No location specified'}
            </p>
          </div>
        </div>
        <Badge 
          variant={pump.status === 'ACTIVE' ? 'default' : 'secondary'} 
          className="text-sm px-3 py-1"
        >
          {pump.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Nozzles Configuration</CardTitle>
              <CardDescription>Manage individual nozzles and fuel types for this pump</CardDescription>
            </div>
            <NozzleForm pumpId={id} fuelTypes={fuelTypes || []} />
          </CardHeader>
          <CardContent>
            {sortedNozzles.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nozzle Number</TableHead>
                      <TableHead>Fuel Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedNozzles.map((nozzle: any) => (
                      <TableRow key={nozzle.id}>
                        <TableCell className="font-medium">Nozzle {nozzle.nozzle_number}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{nozzle.fuel_types?.code}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={nozzle.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {nozzle.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <form action={async () => {
                            'use server';
                            await deleteNozzle(nozzle.id, pump.id);
                          }}>
                            <Button variant="ghost" size="icon" type="submit" className="text-destructive hover:text-destructive hover:bg-destructive/10" title="Delete Nozzle">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">No nozzles configured for this pump.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Assignments
            </CardTitle>
            <CardDescription>Current shift assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {assignments && assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment: any) => (
                  <div key={assignment.id} className="flex flex-col gap-1 p-3 rounded-md border bg-muted/30">
                    <div className="font-medium">{assignment.employees?.full_name}</div>
                    <div className="text-sm text-muted-foreground flex justify-between">
                      <span>Shift: {assignment.shifts?.name}</span>
                      <Badge variant="secondary" className="text-xs">{assignment.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No active assignments.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Recent Meter Readings
          </CardTitle>
          <CardDescription>Latest readings for all nozzles on this pump</CardDescription>
        </CardHeader>
        <CardContent>
          {recentReadings && recentReadings.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Nozzle</TableHead>
                    <TableHead>Previous Meter</TableHead>
                    <TableHead>Current Meter</TableHead>
                    <TableHead>Fuel Sold (L)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentReadings.map((reading) => (
                    <TableRow key={reading.id}>
                      <TableCell>
                        {new Date(reading.reading_date).toLocaleDateString()} {reading.reading_time}
                      </TableCell>
                      <TableCell className="font-medium">
                        Nozzle {reading.pump_nozzles?.nozzle_number}
                      </TableCell>
                      <TableCell>{reading.previous_meter.toLocaleString()}</TableCell>
                      <TableCell>{reading.current_meter.toLocaleString()}</TableCell>
                      <TableCell className="font-bold text-emerald-600">
                        {reading.fuel_sold_liters.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent meter readings found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
