'use client';

import { useState } from 'react';
import { updateMaintenanceStatus } from '@/app/dashboard/maintenance/actions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Play, XCircle } from 'lucide-react';

interface MaintenanceStatusActionsProps {
  id: string;
  currentStatus: string;
}

export function MaintenanceStatusActions({ id, currentStatus }: MaintenanceStatusActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const result = await updateMaintenanceStatus(id, newStatus);
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: `Status updated to ${newStatus}`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') {
    return null; // Terminal states
  }

  return (
    <div className="flex gap-2">
      {currentStatus === 'PENDING' && (
        <Button 
          onClick={() => handleUpdate('IN_PROGRESS')} 
          disabled={isUpdating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Play className="w-4 h-4 mr-2" />
          Start Work
        </Button>
      )}

      {currentStatus === 'IN_PROGRESS' && (
        <Button 
          onClick={() => handleUpdate('COMPLETED')} 
          disabled={isUpdating}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Mark Completed
        </Button>
      )}

      <Button 
        variant="destructive" 
        onClick={() => handleUpdate('CANCELLED')} 
        disabled={isUpdating}
      >
        <XCircle className="w-4 h-4 mr-2" />
        Cancel Task
      </Button>
    </div>
  );
}
