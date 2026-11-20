/* eslint-disable */
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth-helpers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Building2, Phone, User, Eye } from 'lucide-react';
import { AddSupplierDialog } from '@/components/suppliers/add-supplier-dialog';

export const revalidate = 0;

export default async function SuppliersPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const isAuthorized = profile && ['ADMIN', 'MANAGER'].includes(profile.role_name);

  // Fetch suppliers
  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('*')
    .order('name', { ascending: true });

  // Fetch delivery counts for each supplier
  const { data: deliveryCounts } = await supabase
    .from('fuel_deliveries')
    .select('supplier_id');

  const countsMap: Record<string, number> = {};
  deliveryCounts?.forEach((d) => {
    if (d.supplier_id) {
      countsMap[d.supplier_id] = (countsMap[d.supplier_id] || 0) + 1;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Supplier Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage fuel suppliers and contact details
          </p>
        </div>
        {isAuthorized && <AddSupplierDialog />}
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-medium border-b">
              <tr>
                <th className="px-4 py-3">Supplier Name</th>
                <th className="px-4 py-3">Contact Person</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Deliveries</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!suppliers || suppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No suppliers found.
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/dashboard/suppliers/${supplier.id}`} className="hover:underline text-primary">
                        {supplier.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {supplier.contact_name ? (
                        <span className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          {supplier.contact_name}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {supplier.phone ? (
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          {supplier.phone}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          supplier.status === 'ACTIVE'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-muted text-muted-foreground border'
                        }`}
                      >
                        {supplier.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-medium">
                      {countsMap[supplier.id] || 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/suppliers/${supplier.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
