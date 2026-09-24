'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { format } from 'date-fns';

export function DashboardFilters({ fuels = [], pumps = [], shifts = [] }: { fuels?: any[], pumps?: any[], shifts?: any[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const range = searchParams.get('range') || 'today';
  const fuelTypeId = searchParams.get('fuelTypeId') || 'all';
  const pumpId = searchParams.get('pumpId') || 'all';
  const shiftId = searchParams.get('shiftId') || 'all';

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'all') {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  const setFilter = (name: string, value: string) => {
    router.push(pathname + '?' + createQueryString(name, value));
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-lg border">
      <div className="flex flex-wrap items-center gap-2">
        <Button 
          variant={range === 'today' ? 'secondary' : 'ghost'} 
          size="sm" className="h-8" 
          onClick={() => setFilter('range', 'today')}
        >Today</Button>
        <Button 
          variant={range === 'yesterday' ? 'secondary' : 'ghost'} 
          size="sm" className="h-8"
          onClick={() => setFilter('range', 'yesterday')}
        >Yesterday</Button>
        <Button 
          variant={range === '7days' ? 'secondary' : 'ghost'} 
          size="sm" className="h-8"
          onClick={() => setFilter('range', '7days')}
        >Last 7 Days</Button>
        <Button 
          variant={range === '30days' ? 'secondary' : 'ghost'} 
          size="sm" className="h-8"
          onClick={() => setFilter('range', '30days')}
        >Last 30 Days</Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={fuelTypeId} onValueChange={(val) => setFilter('fuelTypeId', val)}>
          <SelectTrigger className="h-8 w-[130px]">
            <SelectValue placeholder="Fuel Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fuels</SelectItem>
            {fuels.map(f => (
              <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={pumpId} onValueChange={(val) => setFilter('pumpId', val)}>
          <SelectTrigger className="h-8 w-[100px]">
            <SelectValue placeholder="Pump" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pumps</SelectItem>
            {pumps.map(p => (
              <SelectItem key={p.id} value={p.id}>Pump {p.pump_number}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={shiftId} onValueChange={(val) => setFilter('shiftId', val)}>
          <SelectTrigger className="h-8 w-[140px]">
            <SelectValue placeholder="Shift" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Shifts</SelectItem>
            {shifts.map(s => (
              <SelectItem key={s.id} value={s.id}>
                {format(new Date(s.start_time), 'MMM dd, ha')} - {format(new Date(s.end_time), 'ha')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
