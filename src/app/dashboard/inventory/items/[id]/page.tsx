import { getInventoryItemDetails } from '../../actions';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ItemTransactionsTable } from '@/components/inventory/item-transactions-table';

export default async function ItemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const details = await getInventoryItemDetails(resolvedParams.id);

  if (!details || !details.item) {
    notFound();
  }

  const { item, transactions } = details;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/inventory/items">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Item Details: {item.name}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SKU / Code</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.item_code}</div>
            <p className="text-xs text-muted-foreground">{item.category}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${item.current_stock <= item.minimum_stock ? 'text-destructive' : ''}`}>
              {item.current_stock} {item.unit}
            </div>
            <p className="text-xs text-muted-foreground">Min stock: {item.minimum_stock}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selling Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number(item.selling_price).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Cost: ${Number(item.cost_price).toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={item.status === 'ACTIVE' ? 'default' : 'secondary'} className="mt-1">
              {item.status}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <ItemTransactionsTable transactions={transactions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
