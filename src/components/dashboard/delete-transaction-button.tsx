'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteTransaction } from '@/app/dashboard/actions';
import { useToast } from '@/hooks/use-toast';

export function DeleteTransactionButton({ transactionId }: { transactionId: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    const result = await deleteTransaction(transactionId);
    setLoading(false);

    if (result.success) {
      toast({ title: 'Success', description: 'Transaction deleted successfully.' });
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to delete transaction.', variant: 'destructive' });
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
      onClick={handleDelete}
      disabled={loading}
      title="Delete Transaction"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
