/* eslint-disable */
import { requirePermission } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { CalibrationForm } from '@/components/tanks/calibration-form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteCalibration } from '@/app/dashboard/tanks/actions';

export const metadata = {
  title: 'Tank Calibrations | Management System',
};

export default async function CalibrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tankId?: string }>;
}) {
  await requirePermission('/dashboard/tanks');
  const { tankId } = await searchParams;
  
  const supabase = await createClient();

  // Fetch all tanks for the selector
  const { data: tanks } = await supabase
    .from('tanks')
    .select('id, tank_number, capacity_liters')
    .order('tank_number');

  // Fetch calibrations for selected tank
  let calibrations: any[] = [];
  if (tankId) {
    const { data } = await supabase
      .from('tank_calibrations')
      .select('*')
      .eq('tank_id', tankId)
      .order('height_cm');
    calibrations = data || [];
  }

  const selectedTank = tanks?.find(t => t.id === tankId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tank Calibrations</h1>
          <p className="text-muted-foreground mt-1">
            Manage height-to-volume mapping for storage tanks.
          </p>
        </div>
        <CalibrationForm tankId={tankId || ''} />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tank Selector Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          <h3 className="font-medium text-sm text-muted-foreground mb-2">Select Tank</h3>
          {tanks?.map((tank) => (
            <Link key={tank.id} href={`/dashboard/tanks/calibrations?tankId=${tank.id}`}>
              <div className={`p-3 rounded-md border cursor-pointer transition-colors ${
                tankId === tank.id 
                  ? 'bg-primary/10 border-primary text-primary font-medium' 
                  : 'bg-card hover:bg-muted'
              }`}>
                Tank {tank.tank_number}
                <div className="text-xs text-muted-foreground mt-1 font-normal">
                  Cap: {tank.capacity_liters.toLocaleString()} L
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Calibrations Table */}
        <div className="flex-1">
          {!tankId ? (
            <div className="flex h-64 items-center justify-center rounded-md border border-dashed bg-card">
              <p className="text-sm text-muted-foreground">Select a tank from the list to view its calibration data.</p>
            </div>
          ) : (
            <div className="rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Height (cm)</TableHead>
                    <TableHead>Volume (Liters)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calibrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                        No calibration data found. Add an entry to begin.
                      </TableCell>
                    </TableRow>
                  ) : (
                    calibrations.map((cal) => (
                      <TableRow key={cal.id}>
                        <TableCell className="font-medium">{cal.height_cm}</TableCell>
                        <TableCell>{cal.quantity_liters.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={cal.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {cal.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <form action={async () => {
                            'use server';
                            await deleteCalibration(cal.id);
                          }}>
                            <Button variant="ghost" size="icon" type="submit" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
