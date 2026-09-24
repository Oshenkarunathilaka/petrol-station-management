import { getLowStockItems } from '../actions';
import { LowStockTable } from '@/components/inventory/low-stock-table';

export default async function LowStockPage() {
  const items = await getLowStockItems();

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
        <h3 className="text-sm font-medium text-destructive">Low Stock Alerts</h3>
        <p className="mt-1 text-sm text-destructive/80">
          The following items have fallen at or below their minimum stock threshold and require reordering.
        </p>
      </div>
      
      <LowStockTable data={items || []} />
    </div>
  );
}
