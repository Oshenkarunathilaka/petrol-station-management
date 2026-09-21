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
import { Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Transaction {
  id: string;
  transaction_date: string;
  payment_method: string;
  total_amount: number;
  status: string;
  pumps: { pump_number: string };
  employees: { full_name: string };
  shifts: { name: string };
  transaction_items: {
    quantity_liters: number;
    unit_price: number;
    pump_nozzles: { nozzle_number: number };
    fuel_types: { code: string };
  }[];
}

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (!transactions.length) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed bg-card">
        <p className="text-sm text-muted-foreground">No transactions found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Fuel</TableHead>
            <TableHead>Qty & Price</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Staff & Shift</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => {
            const item = tx.transaction_items?.[0]; // Assuming 1 item per tx as per UI
            const d = new Date(tx.transaction_date);
            const dateStr = d.toLocaleDateString();
            const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const shortId = tx.id.split('-')[0].toUpperCase();

            return (
              <TableRow key={tx.id}>
                <TableCell>
                  <div className="font-medium">{dateStr}</div>
                  <div className="text-xs text-muted-foreground">{timeStr}</div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{shortId}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{tx.pumps?.pump_number}</div>
                  <div className="text-xs text-muted-foreground">Nozzle {item?.pump_nozzles?.nozzle_number}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item?.fuel_types?.code}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{item?.quantity_liters} L</div>
                  <div className="text-xs text-muted-foreground">@ Rs. {item?.unit_price}</div>
                </TableCell>
                <TableCell className="font-bold text-emerald-600">
                  Rs. {tx.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{tx.payment_method}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{tx.employees?.full_name}</div>
                  <div className="text-xs text-muted-foreground">{tx.shifts?.name}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={tx.status === 'COMPLETED' ? 'default' : 'destructive'}>
                    {tx.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="icon" asChild title="View Details">
                    <Link href={`/dashboard/transactions/${tx.id}`}>
                      <Info className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
