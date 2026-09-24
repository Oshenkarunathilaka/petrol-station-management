/* eslint-disable */
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
import { CalendarDays, Clock, Users, Fuel, Calculator } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const metadata = {
  title: 'Shift Details | Management System',
};

export default async function ShiftDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission('/dashboard/shifts');
  const { id } = await params;
  
  const supabase = await createClient();

  // Fetch shift details
  const { data: shift, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !shift) {
    notFound();
  }

  // Fetch employees assigned to this shift
  const { data: shiftAssignments } = await supabase
    .from('shift_assignments')
    .select(`
      *,
      employees (employee_code, full_name, phone)
    `)
    .eq('shift_id', id);

  // Fetch pumps assigned to this shift
  const { data: pumpAssignments } = await supabase
    .from('pump_assignments')
    .select(`
      *,
      pumps (pump_number),
      employees (full_name)
    `)
    .eq('shift_id', id);

  // Fetch pump readings recorded during this shift
  const { data: readings } = await supabase
    .from('pump_readings')
    .select(`
      *,
      pump_nozzles (nozzle_number, pumps(pump_number))
    `)
    .eq('shift_id', id);

  // Calculate total fuel sold
  const totalFuelSold = readings?.reduce((sum, reading) => sum + Number(reading.fuel_sold_liters || 0), 0) || 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-4 rounded-full">
            <CalendarDays className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{shift.name}</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{new Date(shift.shift_date).toLocaleDateString()}</span>
              <span>•</span>
              <span>{shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}</span>
            </p>
          </div>
        </div>
        <Badge 
          variant={shift.status === 'OPEN' ? 'default' : 'secondary'} 
          className="text-sm px-3 py-1"
        >
          {shift.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fuel Sold</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFuelSold.toLocaleString()} L</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground italic">Not available yet</div>
            <p className="text-xs text-muted-foreground mt-1">Pending transactions module</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Cash</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground italic">Not available yet</div>
            <p className="text-xs text-muted-foreground mt-1">Pending cash reconciliation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Variance</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground italic">Not available yet</div>
            <p className="text-xs text-muted-foreground mt-1">Pending cash reconciliation</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Assigned Personnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {shiftAssignments && shiftAssignments.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shiftAssignments.map((assignment: any) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div className="font-medium">{assignment.employees?.full_name}</div>
                          <div className="text-xs text-muted-foreground">{assignment.employees?.employee_code}</div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{assignment.role}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={assignment.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {assignment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No personnel assigned to this shift.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Pump Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pumpAssignments && pumpAssignments.length > 0 ? (
              <div className="space-y-4">
                {pumpAssignments.map((assignment: any) => (
                  <div key={assignment.id} className="flex flex-col gap-1 p-3 rounded-md border bg-muted/30">
                    <div className="font-medium flex justify-between">
                      <span>{assignment.pumps?.pump_number}</span>
                      <Badge variant="secondary" className="text-xs">{assignment.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Assigned to: {assignment.employees?.full_name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(assignment.assigned_from).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      {' - '}
                      {assignment.assigned_until ? new Date(assignment.assigned_until).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'End of shift'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No pump assignments for this shift.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meter Readings</CardTitle>
          <CardDescription>Readings submitted during this shift</CardDescription>
        </CardHeader>
        <CardContent>
          {readings && readings.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Pump & Nozzle</TableHead>
                    <TableHead>Prev. Meter</TableHead>
                    <TableHead>Curr. Meter</TableHead>
                    <TableHead>Fuel Sold (L)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {readings.map((reading: any) => (
                    <TableRow key={reading.id}>
                      <TableCell>{reading.reading_time}</TableCell>
                      <TableCell className="font-medium">
                        {reading.pump_nozzles?.pumps?.pump_number} - N{reading.pump_nozzles?.nozzle_number}
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
            <p className="text-sm text-muted-foreground">No readings recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
