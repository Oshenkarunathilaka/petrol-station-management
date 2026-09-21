'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FuelStatusBadge } from './fuel-status-badge';
import { Edit, Power, PowerOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toggleFuelTypeStatus } from '@/app/dashboard/fuel/actions';

interface FuelType {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: string;
  created_at: string;
}

interface FuelTypeTableProps {
  fuelTypes: FuelType[];
}

export function FuelTypeTable({ fuelTypes }: FuelTypeTableProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  async function handleToggleStatus(id: string, currentStatus: string) {
    setIsUpdating(id);
    const result = await toggleFuelTypeStatus(id, currentStatus);
    
    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Status Updated',
        description: 'The fuel type status has been successfully updated.',
      });
    }
    setIsUpdating(null);
  }

  if (!fuelTypes.length) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">No fuel types found. Add one to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fuel Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fuelTypes.map((fuel) => (
            <TableRow key={fuel.id}>
              <TableCell className="font-medium">{fuel.name}</TableCell>
              <TableCell>{fuel.code}</TableCell>
              <TableCell className="text-muted-foreground max-w-[200px] truncate">
                {fuel.description || '-'}
              </TableCell>
              <TableCell>
                <FuelStatusBadge status={fuel.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(fuel.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="icon" title="Edit">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    title={fuel.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    disabled={isUpdating === fuel.id}
                    onClick={() => handleToggleStatus(fuel.id, fuel.status)}
                    className={fuel.status === 'ACTIVE' ? 'text-destructive hover:text-destructive' : 'text-emerald-600 hover:text-emerald-600'}
                  >
                    {fuel.status === 'ACTIVE' ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
