import { requirePermission } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { ShiftAssignmentForm } from '@/components/shifts/shift-assignment-form';
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
  title: 'Shift Assignments | Management System',
};

export default async function ShiftAssignmentsPage() {
  await requirePermission('/dashboard/shifts');
  
  const supabase = await createClient();

  // Fetch form dependencies
  const { data: shifts } = await supabase.from('shifts').select('id, name, shift_date, start_time, end_time').eq('status', 'OPEN').order('shift_date', { ascending: false });
  const { data: employees } = await supabase.from('employees').select('id, full_name, position').eq('status', 'ACTIVE').order('full_name');
  const { data: pumps } = await supabase.from('pumps').select('id, pump_number').eq('status', 'ACTIVE').order('pump_number');
  const { data: roles } = await supabase.from('roles').select('name').order('name');

  // Fetch pump assignments (which hold the core scheduling metadata for this combined UI)
  const { data: assignments } = await supabase
    .from('pump_assignments')
    .select(`
      *,
      pumps (pump_number),
      employees (full_name, position),
      shifts (name, shift_date)
    `)
    .order('assigned_from', { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shift Assignments</h1>
          <p className="text-muted-foreground mt-1">
            Schedule employees and allocate workstations.
          </p>
        </div>
        <ShiftAssignmentForm 
          shifts={shifts || []} 
          employees={employees || []} 
          pumps={pumps || []} 
          roles={roles || []}
        />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shift</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Assigned Pump</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!assignments || assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No shift assignments found.
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <div className="font-medium">{assignment.shifts?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(assignment.shifts?.shift_date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{assignment.employees?.full_name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{assignment.pumps?.pump_number}</Badge>
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
