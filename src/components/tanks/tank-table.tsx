'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TankForm } from './tank-form';
import { AlertTriangle, Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface FuelType {
  id: string;
  name: string;
  code: string;
}

interface TankReading {
  calculated_liters: number;
  created_at: string;
}

interface Tank {
  id: string;
  tank_number: string;
  fuel_type_id: string;
  capacity_liters: number;
  minimum_stock_liters: number;
  status: string;
  notes: string | null;
  fuel_types: FuelType;
  tank_readings: TankReading[];
}

interface TankTableProps {
  tanks: Tank[];
  fuelTypes: FuelType[];
}

export function TankTable({ tanks, fuelTypes }: TankTableProps) {
  if (!tanks.length) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">No tanks found. Add one to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tank Number</TableHead>
            <TableHead>Fuel Type</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Min Stock</TableHead>
            <TableHead>Current Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Reading</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tanks.map((tank) => {
            const latestReading = tank.tank_readings?.[0];
            const currentStock = latestReading ? latestReading.calculated_liters : 0;
            const isLowStock = currentStock < tank.minimum_stock_liters;
            
            let statusVariant = 'default' as const;
            if (tank.status === 'MAINTENANCE') statusVariant = 'outline' as const;
            if (tank.status === 'OFFLINE') statusVariant = 'secondary' as const;

            return (
              <TableRow key={tank.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {tank.tank_number}
                    {isLowStock && (
                      <AlertTriangle className="h-4 w-4 text-destructive" title="Low Stock Warning" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{tank.fuel_types?.code}</Badge>
                </TableCell>
                <TableCell>{tank.capacity_liters.toLocaleString()} L</TableCell>
                <TableCell>{tank.minimum_stock_liters.toLocaleString()} L</TableCell>
                <TableCell className={isLowStock ? 'text-destructive font-bold' : 'font-semibold'}>
                  {currentStock.toLocaleString()} L
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant} className={
                    tank.status === 'ACTIVE' ? 'bg-emerald-500 hover:bg-emerald-600' : 
                    tank.status === 'MAINTENANCE' ? 'text-amber-600 border-amber-600' : ''
                  }>
                    {tank.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {latestReading ? new Date(latestReading.created_at).toLocaleDateString() : 'No readings'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" asChild title="View Details">
                      <Link href={`/dashboard/tanks/${tank.id}`}>
                        <Info className="h-4 w-4" />
                      </Link>
                    </Button>
                    <TankForm fuelTypes={fuelTypes} tank={tank} />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
