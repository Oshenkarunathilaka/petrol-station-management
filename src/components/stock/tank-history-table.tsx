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
import { format } from 'date-fns';

export function TankHistoryTable({ data }: { data: Record<string, any>[] }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No reconciliation history found.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Opening</TableHead>
            <TableHead>Deliveries</TableHead>
            <TableHead>Sold</TableHead>
            <TableHead>Expected</TableHead>
            <TableHead>Physical</TableHead>
            <TableHead>Variance</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((recon) => {
            const variance = Number(recon.variance);
            return (
              <TableRow key={recon.id}>
                <TableCell className="font-medium">
                  {format(new Date(recon.reconciliation_date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {format(new Date(recon.opening_period_start), 'MMM dd, HH:mm')} - <br/>
                  {format(new Date(recon.closing_period_end), 'MMM dd, HH:mm')}
                </TableCell>
                <TableCell>{Number(recon.opening_stock).toLocaleString()} L</TableCell>
                <TableCell className="text-emerald-600">+{Number(recon.confirmed_deliveries).toLocaleString()} L</TableCell>
                <TableCell className="text-rose-600">-{Number(recon.fuel_sold).toLocaleString()} L</TableCell>
                <TableCell>{Number(recon.expected_closing_stock).toLocaleString()} L</TableCell>
                <TableCell className="font-semibold">{Number(recon.physical_closing_stock).toLocaleString()} L</TableCell>
                <TableCell>
                  <Badge variant={variance > 0 ? "default" : variance < 0 ? "destructive" : "secondary"}>
                    {variance > 0 ? '+' : ''}{variance.toLocaleString()} L
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={recon.status === 'FINALIZED' ? 'default' : 'secondary'}>
                    {recon.status}
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
