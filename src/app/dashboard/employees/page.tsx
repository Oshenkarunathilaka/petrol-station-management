/* eslint-disable */
import { requirePermission } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { EmployeeTable } from '@/components/employees/employee-table';
import { EmployeeForm } from '@/components/employees/employee-form';

export const metadata = {
  title: 'Employees | Management System',
};

export default async function EmployeesPage() {
  await requirePermission('/dashboard/employees');
  
  const supabase = await createClient();

  // Fetch employees
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .order('full_name');

  // Fetch roles for the form
  const { data: roles } = await supabase
    .from('roles')
    .select('id, name')
    .order('name');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage staff members and their roles within the system.
          </p>
        </div>
        <EmployeeForm roles={roles || []} />
      </div>

      <EmployeeTable employees={employees || []} roles={roles || []} />
    </div>
  );
}
