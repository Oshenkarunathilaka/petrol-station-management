/* eslint-disable */
// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
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
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addPumpReading, getLatestNozzleReading } from '@/app/dashboard/pumps/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  pump_id: z.string().min(1, 'Pump is required'),
  nozzle_id: z.string().min(1, 'Nozzle is required'),
  reading_date: z.string().min(1, 'Date is required'),
  reading_time: z.string().min(1, 'Time is required'),
  previous_meter: z.coerce.number().min(0, 'Previous meter must be non-negative'),
  current_meter: z.coerce.number().min(0, 'Current meter must be non-negative'),
  employee_id: z.string().min(1, 'Employee is required'),
  shift_id: z.string().min(1, 'Shift is required'),
  notes: z.string().optional(),
}).refine((data) => data.current_meter >= data.previous_meter, {
  message: "Current reading cannot be less than previous reading",
  path: ["current_meter"],
});

interface Pump {
  id: string;
  pump_number: string;
  pump_nozzles: {
    id: string;
    nozzle_number: number;
    fuel_types: { code: string };
  }[];
}

interface Employee {
  id: string;
  full_name: string;
}

interface Shift {
  id: string;
  name: string;
}

interface PumpReadingFormProps {
  pumps: Pump[];
  employees: Employee[];
  shifts: Shift[];
}

export function PumpReadingForm({ pumps, employees, shifts }: PumpReadingFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [fetchingPrev, setFetchingPrev] = useState(false);
  const [isFirstReading, setIsFirstReading] = useState(false);
  
  const { toast } = useToast();

  const getToday = () => new Date().toISOString().split('T')[0];
  const getNowTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pump_id: '',
      nozzle_id: '',
      reading_date: getToday(),
      reading_time: getNowTime(),
      previous_meter: 0,
      current_meter: 0,
      employee_id: '',
      shift_id: '',
      notes: '',
    },
  });

  const selectedPumpId = form.watch('pump_id');
  const selectedNozzleId = form.watch('nozzle_id');
  const previousMeter = form.watch('previous_meter');
  const currentMeter = form.watch('current_meter');

  const selectedPump = pumps.find(p => p.id === selectedPumpId);
  const nozzles = selectedPump?.pump_nozzles || [];

  // When nozzle changes, fetch its previous reading automatically
  useEffect(() => {
    async function fetchPreviousReading() {
      if (!selectedNozzleId) {
        setIsFirstReading(false);
        form.setValue('previous_meter', 0);
        return;
      }

      setFetchingPrev(true);
      const res = await getLatestNozzleReading(selectedNozzleId);
      setFetchingPrev(false);

      if (res.error) {
        toast({
          title: 'Error fetching previous reading',
          description: res.error,
          variant: 'destructive',
        });
      } else if (res.previous_meter === null) {
        setIsFirstReading(true);
        form.setValue('previous_meter', 0);
      } else {
        setIsFirstReading(false);
        form.setValue('previous_meter', res.previous_meter);
        form.setValue('current_meter', res.previous_meter); // Help user by starting current at previous
      }
    }

    fetchPreviousReading();
  }, [selectedNozzleId, form, toast]);

  // When pump changes, reset nozzle
  useEffect(() => {
    form.setValue('nozzle_id', '');
  }, [selectedPumpId, form]);

  const fuelSold = currentMeter - previousMeter;
  const isFuelSoldValid = fuelSold >= 0;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsPending(true);
    const formData = new FormData();
    formData.append('nozzle_id', values.nozzle_id);
    formData.append('reading_date', values.reading_date);
    formData.append('reading_time', values.reading_time);
    formData.append('previous_meter', values.previous_meter.toString());
    formData.append('current_meter', values.current_meter.toString());
    formData.append('employee_id', values.employee_id);
    formData.append('shift_id', values.shift_id);
    formData.append('notes', values.notes || '');

    const result = await addPumpReading(formData);
    
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
        description: 'Pump meter reading saved successfully.',
      });
      form.reset({
        pump_id: '',
        nozzle_id: '',
        reading_date: getToday(),
        reading_time: getNowTime(),
        previous_meter: 0,
        current_meter: 0,
        employee_id: '',
        shift_id: '',
        notes: '',
      });
      setIsFirstReading(false);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        form.reset();
        setIsFirstReading(false);
      }
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Meter Reading
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Pump Meter Reading</DialogTitle>
          <DialogDescription>
            Record current meter reading for a specific pump nozzle.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
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
                name="nozzle_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nozzle</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedPumpId || fetchingPrev}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select nozzle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {nozzles.map((n) => (
                          <SelectItem key={n.id} value={n.id}>
                            Nozzle {n.nozzle_number} ({n.fuel_types.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isFirstReading && selectedNozzleId && (
              <Alert className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                <AlertCircle className="h-4 w-4 stroke-amber-600" />
                <AlertTitle>First Reading</AlertTitle>
                <AlertDescription>
                  No previous reading found for this nozzle. Please enter the starting meter value manually.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="previous_meter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous Reading</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        {...field} 
                        readOnly={!isFirstReading} 
                        className={!isFirstReading ? "bg-muted" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="current_meter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Reading</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedNozzleId && (
              <div className={`p-3 rounded-md flex justify-between items-center ${isFuelSoldValid ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                <span className="font-medium">Calculated Fuel Sold:</span>
                <span className="font-bold text-lg">{isFuelSoldValid ? fuelSold.toLocaleString() : 'Invalid'} L</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isPending || fetchingPrev || !isFuelSoldValid}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Reading'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
