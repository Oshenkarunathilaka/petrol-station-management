'use client';
/* eslint-disable */

import { useState } from 'react';
import { updateIncidentStatus } from '@/app/dashboard/incidents/actions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface IncidentStatusActionsProps {
  id: string;
  currentStatus: string;
  userRole: string;
}

export function IncidentStatusActions({ id, currentStatus, userRole }: IncidentStatusActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [resolutionOpen, setResolutionOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [resolutionText, setResolutionText] = useState('');
  const { toast } = useToast();

  const handleUpdate = async (newStatus: string, resolution?: string) => {
    setIsUpdating(true);
    try {
      const result = await updateIncidentStatus(id, newStatus, resolution);
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
        setResolutionOpen(false);
        setResolutionText('');
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

  const promptResolution = (status: string) => {
    setTargetStatus(status);
    setResolutionOpen(true);
  };

  if (currentStatus === 'CLOSED') {
    return null;
  }

  const isAdminOrManager = ['ADMIN', 'MANAGER'].includes(userRole);

  return (
    <>
      <div className="flex gap-2">
        {currentStatus === 'OPEN' && (
          <Button 
            onClick={() => handleUpdate('INVESTIGATING')} 
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Clock className="w-4 h-4 mr-2" />
            Investigate
          </Button>
        )}

        {currentStatus === 'INVESTIGATING' && (
          <Button 
            onClick={() => promptResolution('RESOLVED')} 
            disabled={isUpdating}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Resolve
          </Button>
        )}

        {currentStatus === 'RESOLVED' && isAdminOrManager && (
          <Button 
            onClick={() => promptResolution('CLOSED')} 
            disabled={isUpdating}
            variant="outline"
          >
            <Check className="w-4 h-4 mr-2" />
            Close Incident
          </Button>
        )}

        {/* Admin/Manager Override */}
        {currentStatus === 'OPEN' && isAdminOrManager && (
          <Button 
            onClick={() => promptResolution('CLOSED')} 
            disabled={isUpdating}
            variant="outline"
          >
            <Check className="w-4 h-4 mr-2" />
            Direct Close
          </Button>
        )}
      </div>

      <Dialog open={resolutionOpen} onOpenChange={setResolutionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Resolution</DialogTitle>
            <DialogDescription>
              Please detail how this incident was resolved or why it is being closed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Resolution Details</Label>
              <Textarea 
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Describe the actions taken..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolutionOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleUpdate(targetStatus, resolutionText)} 
              disabled={isUpdating || resolutionText.trim().length < 5}
            >
              {isUpdating ? 'Saving...' : `Confirm ${targetStatus}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
