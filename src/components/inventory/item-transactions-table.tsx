'use client';
// @ts-nocheck

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

export function ItemTransactionsTable({ transactions }: { transactions: any[] }) {
  if (!transactions || transactions.length === 0) {
    return <div className="text-center py-6 text-muted-foreground">No transactions found.</div>;
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return 'default';
      case 'SALE':
        return 'secondary';
      case 'ADJUSTMENT':
        return 'outline';
      case 'RETURN':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Recorded By</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>
                {format(new Date(tx.created_at), 'MMM d, yyyy HH:mm')}
              </TableCell>
              <TableCell>
                <Badge variant={getTypeColor(tx.transaction_type) as any}>
                  {tx.transaction_type}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {tx.transaction_type === 'SALE' ? '-' : tx.transaction_type === 'PURCHASE' || tx.transaction_type === 'RETURN' ? '+' : ''}
                {tx.quantity}
              </TableCell>
              <TableCell>{tx.reference || '-'}</TableCell>
              <TableCell>{tx.profiles?.full_name || 'System'}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={tx.notes}>
                {tx.notes || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
