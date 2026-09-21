'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShiftForm } from './shift-form';
import { Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Shift {
  id: string;
  name: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  shift_assignments: any[];
  pump_assignments: any[];
}

interface ShiftTableProps {
  shifts: Shift[];
}

export function ShiftTable({ shifts }: ShiftTableProps) {
  if (!shifts.length) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">No shifts found. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Shift Name</TableHead>
            <TableHead>Time Window</TableHead>
            <TableHead>Assignments</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shifts.map((shift) => {
            const employeesCount = shift.shift_assignments?.length || 0;
            const pumpsCount = shift.pump_assignments?.length || 0;

            let statusVariant = 'default' as const;
            if (shift.status === 'CLOSED') statusVariant = 'secondary' as const;

            return (
              <TableRow key={shift.id}>
                <TableCell className="font-medium">
                  {new Date(shift.shift_date).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-medium">
                  {shift.name}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">{employeesCount} Employees</Badge>
                    <Badge variant="outline" className="text-xs">{pumpsCount} Pumps</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant} className={
                    shift.status === 'OPEN' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''
                  }>
                    {shift.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" asChild title="View Details">
                      <Link href={`/dashboard/shifts/${shift.id}`}>
                        <Info className="h-4 w-4" />
                      </Link>
                    </Button>
                    <ShiftForm shift={shift} />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
