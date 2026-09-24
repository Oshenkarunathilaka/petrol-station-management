'use client';
// @ts-nocheck

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
  FormDescription,
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
import { addTankReading, getCalculatedLiters } from '@/app/dashboard/tanks/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  tank_id: z.string().min(1, 'Tank is required'),
  reading_date: z.string().min(1, 'Date is required'),
  reading_time: z.string().min(1, 'Time is required'),
  height_cm: z.coerce.number().min(0, 'Height must be non-negative'),
  employee_id: z.string().min(1, 'Employee is required'),
  shift_id: z.string().min(1, 'Shift is required'),
  notes: z.string().optional(),
});

interface Tank {
  id: string;
  tank_number: string;
}

interface Employee {
  id: string;
  full_name: string;
}

interface Shift {
  id: string;
  name: string;
}

interface ReadingFormProps {
  tanks: Tank[];
  employees: Employee[];
  shifts: Shift[];
}

export function ReadingForm({ tanks, employees, shifts }: ReadingFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [calculatedLiters, setCalculatedLiters] = useState<number | null>(null);
  const [calError, setCalError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1); // 1 = Input, 2 = Confirm
  
  const { toast } = useToast();

  const getToday = () => new Date().toISOString().split('T')[0];
  const getNowTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      tank_id: '',
      reading_date: getToday(),
      reading_time: getNowTime(),
      height_cm: 0,
      employee_id: '',
      shift_id: '',
      notes: '',
    },
  });

  const handleNextStep = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setCalculating(true);
    setCalError(null);
    setCalculatedLiters(null);

    const values = form.getValues();
    const result = await getCalculatedLiters(values.tank_id, values.height_cm);

    setCalculating(false);

    if (result.error) {
      setCalError(result.error);
    } else if (result.liters !== undefined) {
      setCalculatedLiters(result.liters);
      setStep(2); // Move to confirm step
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (calculatedLiters === null) return;
    
    setIsPending(true);
    const formData = new FormData();
    formData.append('tank_id', values.tank_id);
    formData.append('reading_date', values.reading_date);
    formData.append('reading_time', values.reading_time);
    formData.append('height_cm', values.height_cm.toString());
    formData.append('calculated_liters', calculatedLiters.toString());
    formData.append('employee_id', values.employee_id);
    formData.append('shift_id', values.shift_id);
    formData.append('notes', values.notes || '');

    const result = await addTankReading(formData);
    
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
        description: 'Tank reading saved successfully.',
      });
      form.reset({
        tank_id: '',
        reading_date: getToday(),
        reading_time: getNowTime(),
        height_cm: 0,
        employee_id: '',
        shift_id: '',
        notes: '',
      });
      setCalculatedLiters(null);
      setCalError(null);
      setStep(1);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        setStep(1);
        setCalError(null);
        setCalculatedLiters(null);
      }
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Reading
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Tank Reading</DialogTitle>
          <DialogDescription>
            Record manual dip-stick height measurements.
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 ? (
          <Form {...form}>
            <form className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="tank_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tank</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tank" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tanks.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              Tank {t.tank_number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="height_cm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Measured Height (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="reading_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="reading_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
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
                  control={form.control as any}
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
                  control={form.control as any}
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
                control={form.control as any}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Additional observations..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {calError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Calibration Error</AlertTitle>
                  <AlertDescription>{calError}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end pt-4">
                <Button type="button" onClick={handleNextStep} disabled={calculating}>
                  {calculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking Calibration...
                    </>
                  ) : (
                    'Next Step'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-6 pt-4">
            <Alert className="bg-primary/5 border-primary/20">
              <AlertTitle className="text-primary font-semibold text-lg">Calculated Volume: {calculatedLiters?.toLocaleString()} L</AlertTitle>
              <AlertDescription className="text-muted-foreground mt-2">
                This volume was calculated exactly from the stored calibration table for the entered height of {form.getValues().height_cm} cm.
              </AlertDescription>
            </Alert>
            
            <div className="text-sm text-muted-foreground">
              Please confirm the calculated volume before saving this reading to the database.
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isPending}>
                Back to Edit
              </Button>
              <Button type="button" onClick={form.handleSubmit(onSubmit as any)} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Confirm and Save'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
