'use client';
/* eslint-disable */

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Truck, AlertTriangle } from 'lucide-react';
import { createDelivery } from '@/app/dashboard/deliveries/actions';

interface NewDeliveryFormProps {
  suppliers: Array<{ id: string; name: string }>;
  fuelTypes: Array<{ id: string; name: string; code: string }>;
  tanks: Array<{ id: string; tank_number: string; fuel_type_id: string; capacity_liters: number }>;
  employees: Array<{ id: string; full_name: string; employee_code: string }>;
}

export const DeliveryForm = NewDeliveryForm;

export function NewDeliveryForm({ suppliers, fuelTypes, tanks, employees }: NewDeliveryFormProps) {
  const router = useRouter();
  const [selectedFuelType, setSelectedFuelType] = useState<string>('');
  const [selectedTank, setSelectedTank] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter available tanks dynamically based on selected fuel type
  const availableTanks = useMemo(() => {
    if (!selectedFuelType) return tanks;
    return tanks.filter((t) => t.fuel_type_id === selectedFuelType);
  }, [selectedFuelType, tanks]);

  // If selected tank becomes invalid after fuel type change, clear it
  const handleFuelTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFuelId = e.target.value;
    setSelectedFuelType(newFuelId);

    const isCurrentTankValid = tanks.some(
      (t) => t.id === selectedTank && t.fuel_type_id === newFuelId
    );
    if (!isCurrentTankValid) {
      setSelectedTank('');
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await createDelivery(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else if (res.deliveryId) {
      router.push(`/dashboard/deliveries/${res.deliveryId}`);
    } else {
      router.push('/dashboard/deliveries');
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().split(' ')[0].slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/deliveries">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            New Fuel Delivery
          </h1>
          <p className="text-sm text-muted-foreground">
            Log incoming stock shipment from a supplier
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-lg shadow-sm overflow-hidden p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-xs bg-destructive/15 text-destructive border border-destructive/20 rounded-md flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supplier */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Supplier *</label>
              <select
                name="supplier_id"
                required
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fuel Type */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Fuel Type *</label>
              <select
                name="fuel_type_id"
                required
                value={selectedFuelType}
                onChange={handleFuelTypeChange}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Fuel Type</option>
                {fuelTypes.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Tank */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Destination Tank *</label>
              <select
                name="tank_id"
                required
                value={selectedTank}
                onChange={(e) => setSelectedTank(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Tank</option>
                {availableTanks.map((t) => (
                  <option key={t.id} value={t.id}>
                    Tank {t.tank_number} ({t.capacity_liters.toLocaleString()} L capacity)
                  </option>
                ))}
              </select>
              {selectedFuelType && availableTanks.length === 0 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                  ⚠️ No active tanks configured for this fuel type.
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Quantity (Liters) *</label>
              <input
                name="quantity_liters"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="e.g. 5000"
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Purchase Price */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Purchase Price per Liter (LKR) *</label>
              <input
                name="purchase_price"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="e.g. 310.00"
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Invoice Number */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Invoice Number</label>
              <input
                name="invoice_number"
                type="text"
                placeholder="INV-2026-001"
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
              />
            </div>

            {/* Reference */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Reference / Bowser #</label>
              <input
                name="reference"
                type="text"
                placeholder="Bowser # WP LL-4521"
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Delivery Date */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Delivery Date *</label>
              <input
                name="delivery_date"
                type="date"
                required
                defaultValue={today}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Delivery Time */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Delivery Time *</label>
              <input
                name="delivery_time"
                type="time"
                required
                defaultValue={nowTime}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Received By */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Received By (Employee)</label>
              <select
                name="received_by"
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Receiving Employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.full_name} ({e.employee_code})
                  </option>
                ))}
              </select>
            </div>

            {/* Initial Status */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Status *</label>
              <select
                name="status"
                defaultValue="PENDING"
                className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="PENDING">Pending (Stock Not Yet Updated)</option>
                <option value="CONFIRMED">Confirmed (Available in Stock)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Notes</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Delivery quality check results, dip readings before/after..."
              className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link href="/dashboard/deliveries">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Delivery'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
