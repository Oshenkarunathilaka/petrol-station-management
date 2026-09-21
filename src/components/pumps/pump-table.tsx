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
import { PumpForm } from './pump-form';
import { Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Pump {
  id: string;
  pump_number: string;
  location: string | null;
  status: string;
  notes: string | null;
  pump_nozzles: any[];
}

interface PumpTableProps {
  pumps: Pump[];
}

export function PumpTable({ pumps }: PumpTableProps) {
  if (!pumps.length) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">No pumps found. Add one to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pump Number</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Nozzles</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pumps.map((pump) => {
            const nozzleCount = pump.pump_nozzles?.length || 0;
            
            let statusVariant = 'default' as const;
            if (pump.status === 'MAINTENANCE') statusVariant = 'outline' as const;
            if (pump.status === 'OFFLINE') statusVariant = 'secondary' as const;

            return (
              <TableRow key={pump.id}>
                <TableCell className="font-medium">
                  {pump.pump_number}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {pump.location || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{nozzleCount} Nozzles</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant} className={
                    pump.status === 'ACTIVE' ? 'bg-emerald-500 hover:bg-emerald-600' : 
                    pump.status === 'MAINTENANCE' ? 'text-amber-600 border-amber-600' : ''
                  }>
                    {pump.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" asChild title="View Details">
                      <Link href={`/dashboard/pumps/${pump.id}`}>
                        <Info className="h-4 w-4" />
                      </Link>
                    </Button>
                    <PumpForm pump={pump} />
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
