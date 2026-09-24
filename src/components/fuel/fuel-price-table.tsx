'use client';
/* eslint-disable */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface FuelType {
  id: string;
  name: string;
  code: string;
}

interface FuelPrice {
  id: string;
  fuel_type_id: string;
  price_per_liter: number;
  effective_from: string;
  effective_until: string | null;
  fuel_types: FuelType; // the joined table
}

interface FuelPriceTableProps {
  fuelPrices: FuelPrice[];
}

export function FuelPriceTable({ fuelPrices }: FuelPriceTableProps) {
  if (!fuelPrices.length) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">No fuel prices recorded yet.</p>
      </div>
    );
  }

  // Calculate status badge based on dates
  const getStatus = (from: string, until: string | null) => {
    const now = new Date().getTime();
    const fromTime = new Date(from).getTime();
    const untilTime = until ? new Date(until).getTime() : null;

    if (fromTime > now) {
      return { label: 'FUTURE', variant: 'outline' as const, className: 'text-amber-600 border-amber-600' };
    }
    if (untilTime && untilTime <= now) {
      return { label: 'PAST', variant: 'secondary' as const, className: 'bg-muted text-muted-foreground' };
    }
    return { label: 'ACTIVE', variant: 'default' as const, className: 'bg-emerald-500 hover:bg-emerald-600 text-white' };
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fuel Type</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Price (Per Liter)</TableHead>
            <TableHead>Effective From</TableHead>
            <TableHead>Effective Until</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fuelPrices.map((price) => {
            const status = getStatus(price.effective_from, price.effective_until);
            return (
              <TableRow key={price.id}>
                <TableCell className="font-medium">
                  {price.fuel_types?.name || 'Unknown'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{price.fuel_types?.code || 'N/A'}</Badge>
                </TableCell>
                <TableCell className="font-bold">
                  ${price.price_per_liter.toFixed(2)}
                </TableCell>
                <TableCell>
                  {new Date(price.effective_from).toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {price.effective_until ? new Date(price.effective_until).toLocaleString() : 'Present'}
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant} className={status.className}>
                    {status.label}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
