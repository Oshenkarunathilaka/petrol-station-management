/* eslint-disable */
import { getExpenses } from './actions';
import { ExpensesTable } from '@/components/expenses/expenses-table';
import { ExpenseSummaryCards } from '@/components/expenses/expense-summary-cards';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function ExpensesPage(
  props: {
    searchParams?: Promise<{ from?: string; to?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const from = searchParams?.from;
  const to = searchParams?.to;
  
  const expenses = await getExpenses(from, to);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">Manage and track company expenses.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/expenses/new">
            <Plus className="mr-2 h-4 w-4" /> Record Expense
          </Link>
        </Button>
      </div>

      <ExpenseSummaryCards data={expenses} />

      <ExpensesTable data={expenses} />
    </div>
  );
}
