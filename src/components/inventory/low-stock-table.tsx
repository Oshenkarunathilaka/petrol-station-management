'use client';
/* eslint-disable */
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
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

export function LowStockTable({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground border rounded-md">
        All inventory items have sufficient stock.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code/SKU</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Current Stock</TableHead>
            <TableHead className="text-right">Min Stock</TableHead>
            <TableHead className="text-right">Difference</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            const difference = item.current_stock - item.minimum_stock;
            const status = difference < 0 ? 'CRITICAL' : 'WARNING';
            
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.item_code}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell className="text-right font-bold text-destructive">
                  {item.current_stock} {item.unit}
                </TableCell>
                <TableCell className="text-right">
                  {item.minimum_stock} {item.unit}
                </TableCell>
                <TableCell className="text-right font-medium text-destructive">
                  {difference} {item.unit}
                </TableCell>
                <TableCell>
                  <Badge variant="destructive">
                    {status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/inventory/items/${item.id}`}>
                      <Eye className="h-4 w-4" />
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
