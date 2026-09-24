/* eslint-disable */
// @ts-nocheck
import { requirePermission } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { PumpAssignmentForm } from '@/components/pumps/pump-assignment-form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Pump Assignments | Management System',
};

export default async function PumpAssignmentsPage() {
  await requirePermission('/dashboard/pump-assignments');
  
  const supabase = await createClient();

  // Fetch form dependencies
  const { data: pumps } = await supabase.from('pumps').select('id, pump_number').eq('status', 'ACTIVE').order('pump_number');
  const { data: employees } = await supabase.from('employees').select('id, full_name').eq('status', 'ACTIVE').order('full_name');
  const { data: shifts } = await supabase.from('shifts').select('id, name').eq('status', 'OPEN').order('name');

  // Fetch assignments
  const { data: assignments } = await supabase
    .from('pump_assignments')
    .select(`
      *,
      pumps (pump_number),
      employees (full_name),
      shifts (name)
    `)
    .order('assigned_from', { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pump Assignments</h1>
          <p className="text-muted-foreground mt-1">
            Assign employees to specific pumps during their shifts.
          </p>
        </div>
        <PumpAssignmentForm 
          pumps={pumps || []} 
          employees={employees || []} 
          shifts={shifts || []} 
        />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Pump</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!assignments || assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No pump assignments found.
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">
                    {/* @ts-expect-error - relation */}
                    {assignment.employees?.full_name}
                  </TableCell>
                  <TableCell>
                    {/* @ts-expect-error - relation */}
                    <Badge variant="outline">{assignment.pumps?.pump_number}</Badge>
                  </TableCell>
                  <TableCell>
                    {/* @ts-expect-error - relation */}
                    {assignment.shifts?.name}
                  </TableCell>
                  <TableCell>
                    {new Date(assignment.assigned_from).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </TableCell>
                  <TableCell>
                    {assignment.assigned_until 
                      ? new Date(assignment.assigned_until).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={assignment.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {assignment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
