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
import { Users, Phone, Mail, Calendar, History, Fuel } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const metadata = {
  title: 'Employee Details | Management System',
};

export default async function EmployeeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission('/dashboard/employees');
  const { id } = await params;
  
  const supabase = await createClient();

  // Fetch employee details
  const { data: employee, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !employee) {
    notFound();
  }

  // Fetch recent shift assignments
  const { data: shiftAssignments } = await supabase
    .from('shift_assignments')
    .select(`
      *,
      shifts (name, shift_date, start_time, end_time)
    `)
    .eq('employee_id', id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch recent pump assignments
  const { data: pumpAssignments } = await supabase
    .from('pump_assignments')
    .select(`
      *,
      pumps (pump_number),
      shifts (name)
    `)
    .eq('employee_id', id)
    .order('assigned_from', { ascending: false })
    .limit(5);

  // Fetch recent pump readings
  const { data: readings } = await supabase
    .from('pump_readings')
    .select(`
      *,
      pump_nozzles (nozzle_number, pumps(pump_number))
    `)
    .eq('employee_id', id)
    .order('reading_date', { ascending: false })
    .order('reading_time', { ascending: false })
    .limit(5);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-4 rounded-full">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{employee.full_name}</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Badge variant="outline">{employee.employee_code}</Badge>
              <span>{employee.position}</span>
            </p>
          </div>
        </div>
        <Badge 
          variant={employee.status === 'ACTIVE' ? 'default' : employee.status === 'ON_LEAVE' ? 'outline' : 'secondary'} 
          className="text-sm px-3 py-1"
        >
          {employee.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{employee.phone || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{employee.email || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Joined: {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'Not provided'}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Recent Shift Allocations
            </CardTitle>
            <CardDescription>Latest shifts this employee was assigned to</CardDescription>
          </CardHeader>
          <CardContent>
            {shiftAssignments && shiftAssignments.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shift</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shiftAssignments.map((assignment: any) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">{assignment.shifts?.name}</TableCell>
                        <TableCell>{new Date(assignment.shifts?.shift_date).toLocaleDateString()}</TableCell>
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
              <p className="text-sm text-muted-foreground">No recent shift allocations.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Recent Pump Assignments
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
                      Shift: {assignment.shifts?.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(assignment.assigned_from).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      {' - '}
                      {assignment.assigned_until ? new Date(assignment.assigned_until).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Present'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent pump assignments.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Recent Meter Readings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {readings && readings.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Pump & Nozzle</TableHead>
                      <TableHead>Fuel Sold (L)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {readings.map((reading: any) => (
                      <TableRow key={reading.id}>
                        <TableCell>
                          <div className="text-sm">{new Date(reading.reading_date).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">{reading.reading_time}</div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {reading.pump_nozzles?.pumps?.pump_number} - N{reading.pump_nozzles?.nozzle_number}
                        </TableCell>
                        <TableCell className="font-bold text-emerald-600">
                          {reading.fuel_sold_liters.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent meter readings.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
