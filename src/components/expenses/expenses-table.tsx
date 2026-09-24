/* eslint-disable */
// @ts-nocheck
'use client';

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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Eye, Filter } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ExpensesTable({ data }: { data: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredData = data.filter((exp) => {
    const matchesSearch = 
      exp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.invoice_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const catUpper = (exp.category || '').toUpperCase();
    const matchesCategory = categoryFilter === 'ALL' || catUpper === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const cat = category?.toUpperCase();
    switch (cat) {
      case 'SALARY': return 'default';
      case 'MAINTENANCE': return 'destructive';
      case 'TRANSPORT': return 'secondary';
      case 'ELECTRICITY': return 'outline';
      case 'EQUIPMENT': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search description, invoice, or user..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="ELECTRICITY">Electricity</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="TRANSPORT">Transport</SelectItem>
              <SelectItem value="EQUIPMENT">Equipment</SelectItem>
              <SelectItem value="SALARY">Salary</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Invoice/Ref</TableHead>
              <TableHead>Recorded By</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No expenses found.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell>
                    {format(new Date(exp.expense_date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCategoryColor(exp.category) as any}>
                      {exp.category?.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={exp.description}>
                    {exp.description}
                  </TableCell>
                  <TableCell>{exp.invoice_reference || '-'}</TableCell>
                  <TableCell>{exp.profiles?.full_name || 'System'}</TableCell>
                  <TableCell className="text-right font-medium text-destructive">
                    ${Number(exp.amount).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/expenses/${exp.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
