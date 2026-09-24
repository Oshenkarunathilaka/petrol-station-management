/* eslint-disable */
import { getExpenseDetails } from '../actions';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, FileText, User, Tag, Clock } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { DeleteExpenseButton } from '@/components/expenses/delete-expense-button';

export default async function ExpenseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const expense = await getExpenseDetails(resolvedParams.id);

  if (!expense) {
    notFound();
  }

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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/expenses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Expense Details</h2>
            <p className="text-muted-foreground">{expense.description}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {/* Note: Edit feature could be added here later if requested, but not explicitly asked for separated edit page. We will only provide Delete as required for destructive action auditing */}
          <DeleteExpenseButton expenseId={expense.id} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Amount</span>
              <span className="text-2xl font-bold text-destructive">
                ${Number(expense.amount).toFixed(2)}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground w-24">Category:</span>
                <Badge variant={getCategoryColor(expense.category) as any}>
                  {expense.category?.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground w-24">Date:</span>
                <span className="text-sm font-medium">
                  {format(new Date(expense.expense_date), 'MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground w-24">Invoice/Ref:</span>
                <span className="text-sm font-medium">{expense.invoice_reference || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground w-24">Recorded By:</span>
                <span className="text-sm font-medium">{expense.profiles?.full_name || 'System'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground w-24">Created At:</span>
                <span className="text-sm font-medium">
                  {format(new Date(expense.created_at), 'MMM d, yyyy HH:mm')}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Description</h4>
              <p className="text-sm bg-muted/50 p-3 rounded-md min-h-[60px]">
                {expense.description}
              </p>
            </div>

            {expense.notes && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Additional Notes</h4>
                <p className="text-sm bg-muted/50 p-3 rounded-md min-h-[60px] whitespace-pre-wrap">
                  {expense.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
