'use client';
// @ts-nocheck

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import { TransactionForm } from './transaction-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function TransactionsTable({ data, items }: { data: any[], items: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredData = data.filter((tx) => {
    const matchesSearch = 
      tx.inventory_items?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || tx.transaction_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PURCHASE': return 'default';
      case 'SALE': return 'secondary';
      case 'ADJUSTMENT': return 'outline';
      case 'RETURN': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by item or reference..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="PURCHASE">Purchase</SelectItem>
              <SelectItem value="SALE">Sale</SelectItem>
              <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
              <SelectItem value="RETURN">Return</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Record Transaction
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Recorded By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    {format(new Date(tx.created_at), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {tx.inventory_items?.name}
                    <div className="text-xs text-muted-foreground">{tx.inventory_items?.item_code}</div>
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Record Inventory Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm items={items} onSuccess={() => setIsAddOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
