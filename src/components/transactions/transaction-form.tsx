'use client';
/* eslint-disable */

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addFuelTransaction, getHistoricalFuelPrice } from '@/app/dashboard/transactions/actions';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  transaction_date: z.string().min(1, 'Date is required'),
  transaction_time: z.string().min(1, 'Time is required'),
  pump_id: z.string().min(1, 'Pump is required'),
  nozzle_id: z.string().min(1, 'Nozzle is required'),
  fuel_type_id: z.string().min(1, 'Fuel Type is required'),
  quantity_liters: z.coerce.number().min(0.01, 'Quantity must be > 0'),
  unit_price: z.coerce.number().min(0, 'Unit price is required'),
  payment_method: z.string().min(1, 'Payment method is required'),
  employee_id: z.string().min(1, 'Employee is required'),
  shift_id: z.string().min(1, 'Shift is required'),
  notes: z.string().default(''),
});

interface Pump {
  id: string;
  pump_number: string;
  pump_nozzles: {
    id: string;
    nozzle_number: number;
    fuel_types: { id: string, name: string, code: string };
  }[];
}

interface TransactionFormProps {
  pumps: Pump[];
  employees: { id: string; full_name: string }[];
  shifts: { id: string; name: string }[];
}

export function TransactionForm({ pumps, employees, shifts }: TransactionFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const router = useRouter();

  const getToday = () => new Date().toISOString().split('T')[0];
  const getNowTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      transaction_date: getToday(),
      transaction_time: getNowTime(),
      pump_id: '',
      nozzle_id: '',
      fuel_type_id: '',
      quantity_liters: 0,
      unit_price: 0,
      payment_method: 'CASH',
      employee_id: '',
      shift_id: '',
      notes: '',
    },
  });

  const selectedPumpId = form.watch('pump_id');
  const selectedNozzleId = form.watch('nozzle_id');
  const selectedFuelTypeId = form.watch('fuel_type_id');
  const transactionDate = form.watch('transaction_date');
  const transactionTime = form.watch('transaction_time');
  const quantity = form.watch('quantity_liters');
  const unitPrice = form.watch('unit_price');

  const selectedPump = pumps.find(p => p.id === selectedPumpId);
  const nozzles = selectedPump?.pump_nozzles || [];
  
  const selectedNozzle = nozzles.find(n => n.id === selectedNozzleId);
  const fuelType = selectedNozzle?.fuel_types;

  // 1. Cascading: When pump changes, reset nozzle
  useEffect(() => {
    form.setValue('nozzle_id', '');
    form.setValue('fuel_type_id', '');
  }, [selectedPumpId, form]);

  // 2. Cascading: When nozzle changes, set fuel type
  useEffect(() => {
    if (fuelType) {
      form.setValue('fuel_type_id', fuelType.id);
    } else {
      form.setValue('fuel_type_id', '');
    }
  }, [selectedNozzleId, fuelType, form]);

  // 3. Price Lookup: When date, time, or fuel type changes
  useEffect(() => {
    async function fetchPrice() {
      if (!selectedFuelTypeId || !transactionDate || !transactionTime) {
        form.setValue('unit_price', 0);
        setPriceError(null);
        return;
      }

      setFetchingPrice(true);
      setPriceError(null);
      const res = await getHistoricalFuelPrice(selectedFuelTypeId, transactionDate, transactionTime);
      setFetchingPrice(false);

      if (res.error) {
        setPriceError(res.error);
        form.setValue('unit_price', 0);
      } else if (res.price_per_liter) {
        form.setValue('unit_price', res.price_per_liter);
      }
    }

    // Debounce slightly if typing time manually, but native time picker usually updates in chunks
    const timeoutId = setTimeout(fetchPrice, 300);
    return () => clearTimeout(timeoutId);
  }, [selectedFuelTypeId, transactionDate, transactionTime, form]);

  const total = quantity * unitPrice;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (priceError) {
      toast({ title: 'Cannot save', description: 'Resolve price errors first.', variant: 'destructive' });
      return;
    }

    setIsPending(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, val]) => {
      formData.append(key, val.toString());
    });

    const result = await addFuelTransaction(formData);
    
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
        description: 'Fuel transaction created successfully.',
      });
      router.push(`/dashboard/transactions/${result.transactionId}`);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
        
        {/* TIME & DATE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md bg-card">
          <h3 className="md:col-span-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">1. Time & Personnel</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control as any}
              name="transaction_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="transaction_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl><Input type="time" {...field} /></FormControl>
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
                    <FormControl><SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
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
                    <FormControl><SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {shifts.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* PUMP & FUEL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md bg-card">
          <h3 className="md:col-span-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">2. Dispenser & Fuel</h3>
          
          <FormField
            control={form.control as any}
            name="pump_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pump Station</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select pump" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {pumps.map(p => <SelectItem key={p.id} value={p.id}>{p.pump_number}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="nozzle_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nozzle</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedPumpId}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select nozzle" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {nozzles.map(n => (
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

          {fuelType && (
            <div className="md:col-span-2 flex items-center gap-2 p-3 bg-secondary/50 rounded-md border border-secondary">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium">Auto-detected Fuel Type:</span>
              <span className="text-sm font-bold">{fuelType.name}</span>
            </div>
          )}
        </div>

        {/* FINANCIALS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md bg-card">
          <h3 className="md:col-span-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">3. Financials</h3>
          
          <FormField
            control={form.control as any}
            name="quantity_liters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity (Liters)</FormLabel>
                <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="unit_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Price (Rs.)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type="number" {...field} readOnly className="bg-muted pl-8" />
                    {fetchingPrice && <Loader2 className="absolute left-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
                    {!fetchingPrice && <span className="absolute left-2 top-2.5 text-sm text-muted-foreground">Rs</span>}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Calculated Total</span>
            <div className="flex-1 rounded-md border bg-muted/50 flex items-center px-3 font-bold text-lg text-emerald-600">
              Rs. {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {priceError && (
            <Alert variant="destructive" className="md:col-span-3">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Pricing Error</AlertTitle>
              <AlertDescription>{priceError}</AlertDescription>
            </Alert>
          )}

          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <FormField
              control={form.control as any}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select payment" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="CARD">Credit/Debit Card</SelectItem>
                      <SelectItem value="QR">QR Code / Mobile Pay</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl><Input placeholder="Vehicle number, customer ID..." {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isPending || fetchingPrice || !!priceError || total <= 0}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Complete Transaction'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
