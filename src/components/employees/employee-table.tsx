/* eslint-disable */
// @ts-nocheck
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
import { EmployeeForm } from './employee-form';
import { Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  position: string;
  status: string;
  hire_date: string | null;
  notes: string | null;
}

interface EmployeeTableProps {
  employees: Employee[];
  roles: { id: string; name: string }[];
}

export function EmployeeTable({ employees, roles }: EmployeeTableProps) {
  if (!employees.length) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">No employees found. Add one to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => {
            let statusVariant = 'default' as const;
            if (employee.status === 'ON_LEAVE') statusVariant = 'outline' as const;
            if (employee.status === 'INACTIVE') statusVariant = 'secondary' as const;

            return (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">
                  {employee.employee_code}
                </TableCell>
                <TableCell className="font-medium">
                  {employee.full_name}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {employee.phone || '-'}
                  {employee.email && <div className="text-xs">{employee.email}</div>}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{employee.position}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant} className={
                    employee.status === 'ACTIVE' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 
                    employee.status === 'ON_LEAVE' ? 'text-amber-600 border-amber-600' : ''
                  }>
                    {employee.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" asChild title="View Details">
                      <Link href={`/dashboard/employees/${employee.id}`}>
                        <Info className="h-4 w-4" />
                      </Link>
                    </Button>
                    <EmployeeForm employee={employee} roles={roles} />
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
