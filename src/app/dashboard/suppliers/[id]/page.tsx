import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth-helpers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Phone, Mail, MapPin, User, FileText, Truck } from 'lucide-react';
import { SupplierEditDialog } from './edit-dialog';

export const revalidate = 0;

export default async function SupplierDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const isAuthorized = profile && ['ADMIN', 'MANAGER'].includes(profile.role_name);

  const { data: supplier } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!supplier) {
    notFound();
  }

  // Fetch delivery history for this supplier
  const { data: deliveries } = await supabase
    .from('fuel_deliveries')
    .select(`
      *,
      fuel_types ( name, code ),
      tanks ( tank_number ),
      employees ( full_name )
    `)
    .eq('supplier_id', supplier.id)
    .order('delivery_date', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/suppliers">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              {supplier.name}
            </h1>
            <p className="text-sm text-muted-foreground">Supplier Details & History</p>
          </div>
        </div>

        {isAuthorized && <SupplierEditDialog supplier={supplier} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-lg border bg-card p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-semibold text-foreground">Contact Info</h2>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  supplier.status === 'ACTIVE'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-muted text-muted-foreground border'
                }`}
              >
                {supplier.status}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground">Contact Person</div>
                  <div className="font-medium">{supplier.contact_name || '—'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground">Phone</div>
                  <div className="font-medium">{supplier.phone || '—'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground">Email</div>
                  <div className="font-medium">{supplier.email || '—'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground">Address</div>
                  <div className="font-medium">{supplier.address || '—'}</div>
                </div>
              </div>

              {supplier.notes && (
                <div className="flex items-start gap-3 pt-2 border-t">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground">Notes</div>
                    <div className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{supplier.notes}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="rounded-lg border bg-card shadow-sm p-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Delivery History ({deliveries?.length || 0})
            </h2>
            <Link href="/dashboard/deliveries/new">
              <Button size="sm" variant="outline">
                New Delivery
              </Button>
            </Link>
          </div>

          <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-medium border-b">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Fuel Type</th>
                    <th className="px-4 py-3">Tank</th>
                    <th className="px-4 py-3 text-right">Quantity</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {!deliveries || deliveries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No deliveries recorded for this supplier.
                      </td>
                    </tr>
                  ) : (
                    deliveries.map((del) => (
                      <tr key={del.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">
                          {new Date(del.delivery_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">{del.fuel_types?.name}</td>
                        <td className="px-4 py-3">{del.tanks?.tank_number}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {Number(del.quantity_liters).toLocaleString()} L
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
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
                            <Button size="sm" variant="ghost">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
