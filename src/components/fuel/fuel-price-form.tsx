/* eslint-disable */
// @ts-nocheck
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
import { addFuelPrice } from '@/app/dashboard/fuel/actions';

const formSchema = z.object({
  fuel_type_id: z.string().min(1, 'Fuel type is required'),
  price_per_liter: z.coerce.number().min(0, 'Price must be positive'),
  effective_from: z.string().min(1, 'Effective date is required'),
  effective_until: z.string().optional(),
});

interface FuelType {
  id: string;
  name: string;
  code: string;
  status: string;
}

interface FuelPriceFormProps {
  fuelTypes: FuelType[];
}

export function FuelPriceForm({ fuelTypes }: FuelPriceFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const activeFuelTypes = fuelTypes.filter(f => f.status === 'ACTIVE');

  // Convert current date to a format suitable for datetime-local input
  const getNowLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fuel_type_id: '',
      price_per_liter: 0,
      effective_from: getNowLocal(),
      effective_until: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsPending(true);
    
    // We must pass ISO strings or valid postgres timestamps
    const effectiveFromDate = new Date(values.effective_from);
    const effectiveUntilDate = values.effective_until ? new Date(values.effective_until) : null;
    
    if (effectiveUntilDate && effectiveUntilDate <= effectiveFromDate) {
      form.setError('effective_until', { message: 'Must be strictly after effective from date.' });
      setIsPending(false);
      return;
    }

    const formData = new FormData();
    formData.append('fuel_type_id', values.fuel_type_id);
    formData.append('price_per_liter', values.price_per_liter.toString());
    formData.append('effective_from', effectiveFromDate.toISOString());
    if (effectiveUntilDate) {
      formData.append('effective_until', effectiveUntilDate.toISOString());
    }

    const result = await addFuelPrice(formData);
    
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
        description: 'Fuel price updated successfully. Historical record preserved.',
      });
      form.reset({
        fuel_type_id: '',
        price_per_liter: 0,
        effective_from: getNowLocal(),
        effective_until: '',
      });
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Update Price
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Fuel Price</DialogTitle>
          <DialogDescription>
            Set a new price for a fuel type. The previous price will be preserved for history.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="fuel_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuel Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a fuel type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeFuelTypes.map(ft => (
                        <SelectItem key={ft.id} value={ft.id}>
                          {ft.name} ({ft.code})
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
              name="price_per_liter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Per Liter ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="effective_from"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Effective From</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="effective_until"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Effective Until (Optional)</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Price'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
