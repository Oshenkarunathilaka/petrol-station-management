/* eslint-disable */
// @ts-nocheck
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addInventoryTransaction } from '@/app/dashboard/inventory/actions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const txSchema = z.object({
  inventory_item_id: z.string().min(1, 'Item is required'),
  transaction_type: z.string().min(1, 'Type is required'),
  quantity: z.coerce.number().min(-999999, 'Invalid quantity').refine(val => val !== 0, 'Quantity cannot be zero'),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type TxFormValues = z.infer<typeof txSchema>;

export function TransactionForm({ items, onSuccess }: { items: any[], onSuccess: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TxFormValues>({
    resolver: zodResolver(txSchema),
    defaultValues: {
      inventory_item_id: '',
      transaction_type: 'PURCHASE',
      quantity: 0,
      reference: '',
      notes: '',
    },
  });

  const txType = form.watch('transaction_type');

  async function onSubmit(data: TxFormValues) {
    setIsSubmitting(true);
    setError(null);
    
    if (data.quantity < 0 && data.transaction_type !== 'ADJUSTMENT') {
      setError('Quantity must be positive for this transaction type.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value?.toString() || '');
    });

    try {
      const result = await addInventoryTransaction(formData);
      if (result.error) {
        setError(result.error);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && <div className="text-sm font-medium text-destructive">{error}</div>}
        
        <FormField
          control={form.control}
          name="inventory_item_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {items.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.item_code})
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
            name="transaction_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PURCHASE">Purchase</SelectItem>
                    <SelectItem value="SALE">Sale</SelectItem>
                    <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                    <SelectItem value="RETURN">Return</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage className="text-xs text-muted-foreground mt-1">
                  {txType === 'SALE' && 'Enter positive amount (deducted automatically)'}
                  {txType === 'ADJUSTMENT' && 'Enter positive or negative amount'}
                </FormMessage>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference</FormLabel>
              <FormControl>
                <Input placeholder="Invoice / Receipt / Reason code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional details..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Recording...' : 'Record Transaction'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
