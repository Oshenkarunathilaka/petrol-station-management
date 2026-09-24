/* eslint-disable */
// @ts-nocheck
import { requirePermission } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { ReadingForm } from '@/components/tanks/reading-form';
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
  title: 'Tank Readings | Management System',
};

export default async function TankReadingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tankId?: string; date?: string }>;
}) {
  await requirePermission('/dashboard/tanks'); // Or tank-readings
  const { tankId, date } = await searchParams;
  
  const supabase = await createClient();

  // Fetch form dependencies
  const { data: tanks } = await supabase.from('tanks').select('id, tank_number').order('tank_number');
  const { data: employees } = await supabase.from('employees').select('id, full_name').eq('status', 'ACTIVE').order('full_name');
  const { data: shifts } = await supabase.from('shifts').select('id, name').eq('status', 'OPEN').order('name');

  // Fetch readings history
  let query = supabase
    .from('tank_readings')
    .select(`
      *,
      tanks (tank_number, fuel_types(code)),
      employees (full_name),
      shifts (name)
    `)
    .order('reading_date', { ascending: false })
    .order('reading_time', { ascending: false });

  if (tankId) query = query.eq('tank_id', tankId);
  if (date) query = query.eq('reading_date', date);

  const { data: readings } = await query;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tank Readings</h1>
          <p className="text-muted-foreground mt-1">
            History of manual tank dip-stick measurements.
          </p>
        </div>
        <ReadingForm 
          tanks={tanks || []} 
          employees={employees || []} 
          shifts={shifts || []} 
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-md border bg-card">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Filter by Tank</label>
          <div className="flex flex-wrap gap-2">
            <Link href={`/dashboard/tanks/readings${date ? `?date=${date}` : ''}`}>
              <Badge variant={!tankId ? 'default' : 'outline'} className="cursor-pointer">All Tanks</Badge>
            </Link>
            {tanks?.map(t => (
              <Link key={t.id} href={`/dashboard/tanks/readings?tankId=${t.id}${date ? `&date=${date}` : ''}`}>
                <Badge variant={tankId === t.id ? 'default' : 'outline'} className="cursor-pointer">Tank {t.tank_number}</Badge>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Date Filter</label>
          <Link href={`/dashboard/tanks/readings${tankId ? `?tankId=${tankId}` : ''}`}>
            <Badge variant={!date ? 'default' : 'outline'} className="cursor-pointer mr-2">All Time</Badge>
          </Link>
          <Link href={`/dashboard/tanks/readings?date=${new Date().toISOString().split('T')[0]}${tankId ? `&tankId=${tankId}` : ''}`}>
            <Badge variant={date ? 'default' : 'outline'} className="cursor-pointer">Today</Badge>
          </Link>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Tank</TableHead>
              <TableHead>Fuel Type</TableHead>
              <TableHead>Height (cm)</TableHead>
              <TableHead>Calculated Vol (L)</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Shift</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!readings || readings.length === 0 ? (
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
                    Tank {reading.tanks?.tank_number}
                  </TableCell>
                  <TableCell>
                    {/* @ts-expect-error - relation */}
                    <Badge variant="outline">{reading.tanks?.fuel_types?.code}</Badge>
                  </TableCell>
                  <TableCell>{reading.height_cm}</TableCell>
                  <TableCell className="font-bold">{reading.calculated_liters.toLocaleString()}</TableCell>
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
