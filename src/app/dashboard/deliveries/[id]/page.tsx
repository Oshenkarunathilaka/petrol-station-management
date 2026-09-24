import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth-helpers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Truck, Building2, Fuel, Container, Calendar, FileText, User, Hash, FileCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { DeliveryActions } from './delivery-actions';

export const revalidate = 0;

export default async function DeliveryDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const isAuthorized = profile && ['ADMIN', 'MANAGER', 'SUPERVISOR'].includes(profile.role_name);

  const { data: delivery } = await supabase
    .from('fuel_deliveries')
    .select(`
      *,
      suppliers ( id, name, contact_name, phone ),
      fuel_types ( id, name, code ),
      tanks ( id, tank_number, capacity_liters ),
      employees ( id, full_name, employee_code )
    `)
    .eq('id', params.id)
    .single();

  if (!delivery) {
    notFound();
  }

  const deliveryDate = new Date(delivery.delivery_date);
  const totalCost = Number(delivery.quantity_liters) * Number(delivery.purchase_price);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/deliveries">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              Delivery Details
            </h1>
            <p className="text-sm text-muted-foreground font-mono">
              ID: {delivery.id}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            delivery.status === 'CONFIRMED' || delivery.status === 'COMPLETED'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : delivery.status === 'PENDING'
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              : 'bg-destructive/15 text-destructive border border-destructive/20'
          }`}
        >
          {delivery.status}
        </span>
      </div>

      {delivery.status === 'PENDING' && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                Pending Confirmation
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                This delivery has not yet been confirmed. It will not be included in stock availability calculations until confirmed.
              </p>
            </div>
          </div>
          <DeliveryActions deliveryId={delivery.id} status={delivery.status} isAuthorized={isAuthorized || false} />
        </div>
      )}

      {delivery.status === 'CONFIRMED' && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
              Delivery Confirmed & Stock Logged
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
              This delivery has been confirmed and logged as historical stock movement.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipment Details */}
        <div className="bg-card border rounded-lg p-5 space-y-4 shadow-sm">
          <h2 className="text-base font-semibold text-foreground border-b pb-2 flex items-center gap-2">
            <Fuel className="h-4 w-4 text-primary" />
            Fuel & Tank Details
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Fuel className="h-3.5 w-3.5" /> Fuel Type:
              </span>
              <span className="font-semibold text-foreground">
                {delivery.fuel_types?.name} ({delivery.fuel_types?.code})
              </span>
            </div>

            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Container className="h-3.5 w-3.5" /> Destination Tank:
              </span>
              <Link href={`/dashboard/tanks/${delivery.tank_id}`} className="font-semibold text-primary hover:underline">
                Tank {delivery.tanks?.tank_number}
              </Link>
            </div>

            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Quantity Delivered:</span>
              <span className="font-bold text-foreground text-base">
                {Number(delivery.quantity_liters).toLocaleString()} L
              </span>
            </div>

            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Purchase Price / Liter:</span>
              <span className="font-medium text-foreground">
                LKR {Number(delivery.purchase_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Total Purchase Cost:</span>
              <span className="font-bold text-primary text-base">
                LKR {totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Supplier & Audit Details */}
        <div className="bg-card border rounded-lg p-5 space-y-4 shadow-sm">
          <h2 className="text-base font-semibold text-foreground border-b pb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Supplier & Logistics Info
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Supplier:
              </span>
              <Link href={`/dashboard/suppliers/${delivery.supplier_id}`} className="font-semibold text-primary hover:underline">
                {delivery.suppliers?.name}
              </Link>
            </div>

            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" /> Invoice Number:
              </span>
              <span className="font-mono text-xs font-semibold">{delivery.invoice_number || '—'}</span>
            </div>

            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <FileCheck className="h-3.5 w-3.5" /> Reference / Bowser #:
              </span>
              <span className="font-medium">{delivery.reference || '—'}</span>
            </div>

            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Delivery Date & Time:
              </span>
              <span className="font-medium">
                {deliveryDate.toLocaleDateString()} at {deliveryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Received By:
              </span>
              <span className="font-medium">{delivery.employees?.full_name || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {delivery.notes && (
        <div className="bg-card border rounded-lg p-5 shadow-sm space-y-2">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Notes & Remarks
          </h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{delivery.notes}</p>
        </div>
      )}
    </div>
  );
}
