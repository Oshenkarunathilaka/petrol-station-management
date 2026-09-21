'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { assignEmployeeToShift } from '@/app/dashboard/shifts/assignments/actions';

const formSchema = z.object({
  employee_id: z.string().min(1, 'Employee is required'),
  shift_id: z.string().min(1, 'Shift is required'),
  pump_id: z.string().min(1, 'Pump is required'),
  role: z.string().min(1, 'Role is required'),
  start_date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_date: z.string().min(1, 'Date is required'),
  end_time: z.string().min(1, 'End time is required'),
  status: z.string().default('ACTIVE'),
});

interface Employee {
  id: string;
  full_name: string;
  position: string;
}

interface Shift {
  id: string;
  name: string;
  shift_date: string;
  start_time: string;
  end_time: string;
}

interface Pump {
  id: string;
  pump_number: string;
}

interface ShiftAssignmentFormProps {
  employees: Employee[];
  shifts: Shift[];
  pumps: Pump[];
  roles: { name: string }[];
}

export function ShiftAssignmentForm({ employees, shifts, pumps, roles }: ShiftAssignmentFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const getToday = () => new Date().toISOString().split('T')[0];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: '',
      shift_id: '',
      pump_id: '',
      role: '',
      start_date: getToday(),
      start_time: '00:00',
      end_date: getToday(),
      end_time: '23:59',
      status: 'ACTIVE',
    },
  });

  // When a shift is selected, automatically populate the start/end dates/times
  const handleShiftSelect = (shiftId: string) => {
    form.setValue('shift_id', shiftId);
    const selectedShift = shifts.find(s => s.id === shiftId);
    if (selectedShift) {
      form.setValue('start_date', selectedShift.shift_date);
      form.setValue('end_date', selectedShift.shift_date); // Assuming same day for UI simplicity
      form.setValue('start_time', selectedShift.start_time.slice(0, 5));
      form.setValue('end_time', selectedShift.end_time.slice(0, 5));
    }
  };

  // When an employee is selected, automatically set their default role
  const handleEmployeeSelect = (employeeId: string) => {
    form.setValue('employee_id', employeeId);
    const selectedEmployee = employees.find(e => e.id === employeeId);
    if (selectedEmployee) {
      form.setValue('role', selectedEmployee.position);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsPending(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await assignEmployeeToShift(formData);
    
    setIsPending(false);

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Shift assignment created successfully.',
      });
      form.reset();
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Assign to Shift
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assign Employee to Shift & Pump</DialogTitle>
          <DialogDescription>
            Schedule an employee for a specific shift and assign them a workstation.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shift_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift</FormLabel>
                    <Select onValueChange={handleShiftSelect} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {shifts.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} ({new Date(s.shift_date).toLocaleDateString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pump_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Pump</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pump" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {pumps.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.pump_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <Select onValueChange={handleEmployeeSelect} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duty Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((r) => (
                          <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 border p-4 rounded-md bg-muted/10">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Create Assignment'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
