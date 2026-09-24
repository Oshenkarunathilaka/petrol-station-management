import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Truck, Plus, Filter, Eye } from 'lucide-react';

export const revalidate = 0;

interface SearchParams {
  startDate?: string;
  endDate?: string;
  supplierId?: string;
  fuelTypeId?: string;
  tankId?: string;
  status?: string;
}

export default async function DeliveriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();

  // Fetch filter dropdown options
  const { data: suppliers } = await supabase.from('suppliers').select('id, name').order('name');
  const { data: fuelTypes } = await supabase.from('fuel_types').select('id, name').order('name');
  const { data: tanks } = await supabase.from('tanks').select('id, tank_number').order('tank_number');

  // Build query
  let query = supabase
    .from('fuel_deliveries')
    .select(`
      *,
      suppliers ( name ),
      fuel_types ( name, code ),
      tanks ( tank_number ),
      employees ( full_name )
    `)
    .order('delivery_date', { ascending: false });

  if (searchParams.supplierId) {
    query = query.eq('supplier_id', searchParams.supplierId);
  }
  if (searchParams.fuelTypeId) {
    query = query.eq('fuel_type_id', searchParams.fuelTypeId);
  }
  if (searchParams.tankId) {
    query = query.eq('tank_id', searchParams.tankId);
  }
  if (searchParams.status) {
    query = query.eq('status', searchParams.status);
  }
  if (searchParams.startDate) {
    query = query.gte('delivery_date', `${searchParams.startDate}T00:00:00`);
  }
  if (searchParams.endDate) {
    query = query.lte('delivery_date', `${searchParams.endDate}T23:59:59`);
  }

  const { data: deliveries } = await query;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            Fuel Deliveries
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage incoming fuel shipments and delivery logs
          </p>
        </div>
        <Link href="/dashboard/deliveries/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Delivery
          </Button>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-card border rounded-lg p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Filter className="h-4 w-4 text-primary" />
          Filter Deliveries
        </div>
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="text-muted-foreground font-medium mb-1 block">Start Date</label>
            <input
              type="date"
              name="startDate"
              defaultValue={searchParams.startDate || ''}
              className="w-full px-2.5 py-1.5 border rounded-md bg-background"
            />
          </div>

          <div>
            <label className="text-muted-foreground font-medium mb-1 block">End Date</label>
            <input
              type="date"
              name="endDate"
              defaultValue={searchParams.endDate || ''}
              className="w-full px-2.5 py-1.5 border rounded-md bg-background"
            />
          </div>

          <div>
            <label className="text-muted-foreground font-medium mb-1 block">Supplier</label>
            <select
              name="supplierId"
              defaultValue={searchParams.supplierId || ''}
              className="w-full px-2.5 py-1.5 border rounded-md bg-background"
            >
              <option value="">All Suppliers</option>
              {suppliers?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-muted-foreground font-medium mb-1 block">Fuel Type</label>
            <select
              name="fuelTypeId"
              defaultValue={searchParams.fuelTypeId || ''}
              className="w-full px-2.5 py-1.5 border rounded-md bg-background"
            >
              <option value="">All Fuel Types</option>
              {fuelTypes?.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-muted-foreground font-medium mb-1 block">Tank</label>
            <select
              name="tankId"
              defaultValue={searchParams.tankId || ''}
              className="w-full px-2.5 py-1.5 border rounded-md bg-background"
            >
              <option value="">All Tanks</option>
              {tanks?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tank_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-muted-foreground font-medium mb-1 block">Status</label>
            <select
              name="status"
              defaultValue={searchParams.status || ''}
              className="w-full px-2.5 py-1.5 border rounded-md bg-background"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="lg:col-span-6 flex justify-end gap-2 pt-2 border-t">
            <Link href="/dashboard/deliveries">
              <Button type="button" variant="outline" size="sm">
                Reset Filters
              </Button>
            </Link>
            <Button type="submit" size="sm">
              Apply Filters
            </Button>
          </div>
        </form>
      </div>

      {/* Deliveries Data Table */}
      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-medium border-b">
              <tr>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Fuel</th>
                <th className="px-4 py-3">Tank</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3 text-right">Purchase Price</th>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Received By</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!deliveries || deliveries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                    No deliveries found matching the criteria.
                  </td>
                </tr>
              ) : (
                deliveries.map((del) => {
                  const delDate = new Date(del.delivery_date);
                  return (
                    <tr key={del.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        {delDate.toLocaleDateString()}
                        <div className="text-xs text-muted-foreground">
                          {delDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-4 py-3">{del.suppliers?.name || '—'}</td>
                      <td className="px-4 py-3 font-medium">{del.fuel_types?.name || '—'}</td>
                      <td className="px-4 py-3">{del.tanks?.tank_number || '—'}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {Number(del.quantity_liters).toLocaleString()} L
                      </td>
                      <td className="px-4 py-3 text-right">
                        LKR {Number(del.purchase_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{del.invoice_number || '—'}</td>
                      <td className="px-4 py-3">{del.employees?.full_name || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            del.status === 'CONFIRMED' || del.status === 'COMPLETED'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : del.status === 'PENDING'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-destructive/15 text-destructive border border-destructive/20'
                          }`}
                        >
                          {del.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/dashboard/deliveries/${del.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
