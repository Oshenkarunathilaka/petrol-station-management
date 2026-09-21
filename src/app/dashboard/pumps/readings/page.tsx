import { requirePermission } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { PumpReadingForm } from '@/components/pumps/pump-reading-form';
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

export const metadata = {
  title: 'Pump Meter Readings | Management System',
};

export default async function PumpReadingsPage({
  searchParams,
}: {
  searchParams: Promise<{ pumpId?: string; date?: string }>;
}) {
  await requirePermission('/dashboard/pump-readings');
  const { pumpId, date } = await searchParams;
  
  const supabase = await createClient();

  // Fetch form dependencies
  const { data: pumps } = await supabase.from('pumps').select(`
    id, pump_number, 
    pump_nozzles (id, nozzle_number, fuel_types(code))
  `).order('pump_number');
  
  const { data: employees } = await supabase.from('employees').select('id, full_name').eq('status', 'ACTIVE').order('full_name');
  const { data: shifts } = await supabase.from('shifts').select('id, name').eq('status', 'OPEN').order('name');

  // Build reading history query
  let query = supabase
    .from('pump_readings')
    .select(`
      *,
      pump_nozzles (
        nozzle_number,
        pumps (id, pump_number),
        fuel_types (code)
      ),
      employees (full_name),
      shifts (name)
    `)
    .order('reading_date', { ascending: false })
    .order('reading_time', { ascending: false });

  if (date) query = query.eq('reading_date', date);
  // Filtering by pump requires joining, which is tricky in postgrest filtering directly.
  // We'll filter in JS if pumpId is provided for simplicity in this exercise.
  
  const { data: readingsData } = await query;
  
  let readings = readingsData || [];
  if (pumpId) {
    // @ts-expect-error - deep relation access
    readings = readings.filter(r => r.pump_nozzles?.pumps?.id === pumpId);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meter Readings</h1>
          <p className="text-muted-foreground mt-1">
            History of pump nozzle meter readings and fuel sales.
          </p>
        </div>
        <PumpReadingForm 
          // @ts-expect-error - deep relation mapping
          pumps={pumps || []} 
          employees={employees || []} 
          shifts={shifts || []} 
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-md border bg-card">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Filter by Pump</label>
          <div className="flex flex-wrap gap-2">
            <Link href={`/dashboard/pumps/readings${date ? `?date=${date}` : ''}`}>
              <Badge variant={!pumpId ? 'default' : 'outline'} className="cursor-pointer">All Pumps</Badge>
            </Link>
            {pumps?.map(p => (
              <Link key={p.id} href={`/dashboard/pumps/readings?pumpId=${p.id}${date ? `&date=${date}` : ''}`}>
                <Badge variant={pumpId === p.id ? 'default' : 'outline'} className="cursor-pointer">{p.pump_number}</Badge>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Date Filter</label>
          <Link href={`/dashboard/pumps/readings${pumpId ? `?pumpId=${pumpId}` : ''}`}>
            <Badge variant={!date ? 'default' : 'outline'} className="cursor-pointer mr-2">All Time</Badge>
          </Link>
          <Link href={`/dashboard/pumps/readings?date=${new Date().toISOString().split('T')[0]}${pumpId ? `&pumpId=${pumpId}` : ''}`}>
            <Badge variant={date ? 'default' : 'outline'} className="cursor-pointer">Today</Badge>
          </Link>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Pump & Nozzle</TableHead>
              <TableHead>Prev. Meter</TableHead>
              <TableHead>Curr. Meter</TableHead>
              <TableHead>Fuel Sold (L)</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Shift</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {readings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No readings found matching the filters.
                </TableCell>
              </TableRow>
            ) : (
              readings.map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell>
                    {new Date(reading.reading_date).toLocaleDateString()} at {reading.reading_time}
                  </TableCell>
                  <TableCell className="font-medium">
                    {/* @ts-expect-error - relation */}
                    {reading.pump_nozzles?.pumps?.pump_number} - Nozzle {reading.pump_nozzles?.nozzle_number}
                    <div className="text-xs text-muted-foreground font-normal">
                      {/* @ts-expect-error - relation */}
                      {reading.pump_nozzles?.fuel_types?.code}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{reading.previous_meter.toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{reading.current_meter.toLocaleString()}</TableCell>
                  <TableCell className="font-bold text-emerald-600">{reading.fuel_sold_liters.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{reading.employees?.full_name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{reading.shifts?.name}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
