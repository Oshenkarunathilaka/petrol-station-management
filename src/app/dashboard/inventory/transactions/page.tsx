/* eslint-disable */
import { getInventoryTransactions, getInventoryItems } from '../actions';
import { TransactionsTable } from '@/components/inventory/transactions-table';

export default async function InventoryTransactionsPage() {
  const [transactions, items] = await Promise.all([
    getInventoryTransactions(),
    getInventoryItems()
  ]);

  return (
    <div className="space-y-6">
      <TransactionsTable 
        data={transactions || []} 
        items={items?.filter(i => i.status === 'ACTIVE') || []} 
      />
    </div>
  );
}
