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
import { addPumpAssignment } from '@/app/dashboard/pumps/actions';

const formSchema = z.object({
  employee_id: z.string().min(1, 'Employee is required'),
  pump_id: z.string().min(1, 'Pump is required'),
  shift_id: z.string().min(1, 'Shift is required'),
  start_date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Time is required'),
  end_date: z.string().optional(),
  end_time: z.string().optional(),
  status: z.string().default('ACTIVE'),
});

interface Employee {
  id: string;
  full_name: string;
}

interface Pump {
  id: string;
  pump_number: string;
}

interface Shift {
  id: string;
  name: string;
}

interface PumpAssignmentFormProps {
  employees: Employee[];
  pumps: Pump[];
  shifts: Shift[];
}

export function PumpAssignmentForm({ employees, pumps, shifts }: PumpAssignmentFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const getToday = () => new Date().toISOString().split('T')[0];
  const getNowTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: '',
      pump_id: '',
      shift_id: '',
      start_date: getToday(),
      start_time: getNowTime(),
      end_date: '',
      end_time: '',
      status: 'ACTIVE',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsPending(true);
    
    // Construct ISO datetimes
    const assigned_from = new Date(`${values.start_date}T${values.start_time}`).toISOString();
    let assigned_until = null;
    if (values.end_date && values.end_time) {
      assigned_until = new Date(`${values.end_date}T${values.end_time}`).toISOString();
    }

    const formData = new FormData();
    formData.append('employee_id', values.employee_id);
    formData.append('pump_id', values.pump_id);
    formData.append('shift_id', values.shift_id);
    formData.append('assigned_from', assigned_from);
    if (assigned_until) formData.append('assigned_until', assigned_until);
    formData.append('status', values.status);

    const result = await addPumpAssignment(formData);
    
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
        description: 'Pump assignment created successfully.',
      });
      form.reset({
        employee_id: '',
        pump_id: '',
        shift_id: '',
        start_date: getToday(),
        start_time: getNowTime(),
        end_date: '',
        end_time: '',
        status: 'ACTIVE',
      });
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Assign Pump
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Pump to Employee</DialogTitle>
          <DialogDescription>
            Assign an employee to a specific pump for a shift.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pump_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pump</FormLabel>
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
              <FormField
                control={form.control}
                name="shift_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {shifts.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
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
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
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
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
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
                    <FormLabel>End Time (Optional)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
