/* eslint-disable */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DeleteTransactionButton } from './delete-transaction-button';

interface RecentTransactionsProps {
  transactions: {
    id: string;
    fullId: string;
    time: string;
    pump: string;
    fuel: string;
    qty: string;
    amount: string;
    payment: string;
    employee: string;
  }[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest fuel sales from all active pumps</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Pump</TableHead>
                <TableHead>Fuel Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium text-xs">{tx.id}</TableCell>
                  <TableCell className="text-muted-foreground">{tx.time}</TableCell>
                  <TableCell>{tx.pump}</TableCell>
                  <TableCell>{tx.fuel}</TableCell>
                  <TableCell>{tx.qty}</TableCell>
                  <TableCell className="font-medium">{tx.amount}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      tx.payment === 'CASH' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' :
                      tx.payment === 'CARD' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                      'border-purple-200 text-purple-700 bg-purple-50'
                    }>
                      {tx.payment}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{tx.employee}</TableCell>
                  <TableCell>
                    <DeleteTransactionButton transactionId={tx.fullId} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
