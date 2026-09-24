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
import { Plus, Edit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addTank, updateTank } from '@/app/dashboard/tanks/actions';

const formSchema = z.object({
  tank_number: z.string().min(1, 'Tank number is required'),
  fuel_type_id: z.string().min(1, 'Fuel type is required'),
  capacity_liters: z.coerce.number().min(1, 'Capacity must be greater than zero'),
  minimum_stock_liters: z.coerce.number().min(0, 'Minimum stock cannot be negative'),
  status: z.string().default('ACTIVE'),
  notes: z.string().optional(),
}).refine((data) => data.minimum_stock_liters <= data.capacity_liters, {
  message: "Minimum stock cannot exceed capacity",
  path: ["minimum_stock_liters"],
});

interface FuelType {
  id: string;
  name: string;
  code: string;
}

interface Tank {
  id: string;
  tank_number: string;
  fuel_type_id: string;
  capacity_liters: number;
  minimum_stock_liters: number;
  status: string;
  notes: string | null;
}

interface TankFormProps {
  fuelTypes: FuelType[];
  tank?: Tank; // If provided, we are editing
}

export function TankForm({ fuelTypes, tank }: TankFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const isEditing = !!tank;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tank_number: tank?.tank_number || '',
      fuel_type_id: tank?.fuel_type_id || '',
      capacity_liters: tank?.capacity_liters || 0,
      minimum_stock_liters: tank?.minimum_stock_liters || 0,
      status: tank?.status || 'ACTIVE',
      notes: tank?.notes || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsPending(true);
    const formData = new FormData();
    formData.append('tank_number', values.tank_number);
    formData.append('fuel_type_id', values.fuel_type_id);
    formData.append('capacity_liters', values.capacity_liters.toString());
    formData.append('minimum_stock_liters', values.minimum_stock_liters.toString());
    formData.append('status', values.status);
    formData.append('notes', values.notes || '');

    const result = isEditing 
      ? await updateTank(tank.id, formData)
      : await addTank(formData);
    
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
        description: isEditing ? 'Tank updated successfully.' : 'Tank added successfully.',
      });
      if (!isEditing) form.reset();
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="outline" size="icon" title="Edit">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Tank
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Tank' : 'Add Tank'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update tank details.' : 'Register a new fuel tank for the station.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 pt-4">
            <FormField
              control={form.control as any}
              name="tank_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tank Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. T-01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="fuel_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuel Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fuelTypes.map((ft) => (
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="capacity_liters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity (L)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="minimum_stock_liters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Stock (L)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control as any}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="OFFLINE">Offline</SelectItem>
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
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional notes..." {...field} />
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
                  'Save Tank'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
