/* eslint-disable */
import { getInventoryItems } from '../actions';
import { ItemsTable } from '@/components/inventory/items-table';

export default async function InventoryItemsPage() {
  const items = await getInventoryItems();

  return (
    <div className="space-y-6">
      <ItemsTable data={items || []} />
    </div>
  );
}
