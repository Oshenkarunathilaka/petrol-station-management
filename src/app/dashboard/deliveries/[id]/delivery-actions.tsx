'use client';
/* eslint-disable */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { confirmDelivery, cancelDelivery } from '../actions';

interface DeliveryActionsProps {
  deliveryId: string;
  status: string;
  isAuthorized: boolean;
}

export function DeliveryActions({ deliveryId, status, isAuthorized }: DeliveryActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthorized || status !== 'PENDING') {
    return null;
  }

  async function handleConfirm() {
    if (!confirm('Are you sure you want to CONFIRM this delivery? Confirmed deliveries will be counted towards available fuel stock.')) {
      return;
    }
    setLoading(true);
    setError(null);
    const res = await confirmDelivery(deliveryId);
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.refresh();
    }
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to CANCEL this delivery?')) {
      return;
    }
    setLoading(true);
    setError(null);
    const res = await cancelDelivery(deliveryId);
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-3 text-xs bg-destructive/15 text-destructive border border-destructive/20 rounded-md flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleConfirm}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          {loading ? 'Processing...' : 'Confirm Delivery'}
        </Button>
        <Button
          onClick={handleCancel}
          disabled={loading}
          variant="outline"
          className="text-destructive hover:bg-destructive/10 flex items-center gap-2"
        >
          <XCircle className="h-4 w-4" />
          Cancel Delivery
        </Button>
      </div>
    </div>
  );
}
