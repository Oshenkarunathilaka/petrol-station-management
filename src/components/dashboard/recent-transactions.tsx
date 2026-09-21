import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// MOCK DATA - Will be replaced with real Supabase queries later
const transactions = [
  { id: 'TRX-1045', time: '10:42 AM', pump: 'Pump 1', fuel: 'Petrol 95', qty: '45.5 L', amount: '$68.25', payment: 'CARD', employee: 'John Doe' },
  { id: 'TRX-1044', time: '10:38 AM', pump: 'Pump 3', fuel: 'Auto Diesel', qty: '120.0 L', amount: '$174.00', payment: 'CASH', employee: 'Jane Smith' },
  { id: 'TRX-1043', time: '10:30 AM', pump: 'Pump 2', fuel: 'Petrol 92', qty: '32.0 L', amount: '$52.80', payment: 'CARD', employee: 'John Doe' },
  { id: 'TRX-1042', time: '10:25 AM', pump: 'Pump 4', fuel: 'Petrol 95', qty: '55.0 L', amount: '$82.50', payment: 'QR', employee: 'Jane Smith' },
  { id: 'TRX-1041', time: '10:15 AM', pump: 'Pump 1', fuel: 'Super Diesel', qty: '80.0 L', amount: '$116.00', payment: 'CASH', employee: 'John Doe' },
];

export function RecentTransactions() {
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
