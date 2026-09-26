/* eslint-disable */
// @ts-nocheck
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
import { format, isValid } from 'date-fns';

const TIME_PATTERN = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

// Stable local reference date so formatting a time-only value never depends on "now".
const TIME_REFERENCE = new Date(2000, 0, 1);

/**
 * Postgres `TIME` columns come back as "HH:mm:ss" strings, which `new Date()` cannot parse.
 * This converts such a value into a real local Date, optionally rebased onto a given day.
 */
function toTimeDate(value: unknown, base?: Date | null): Date | null {
  if (typeof value !== 'string') return null;

  const match = TIME_PATTERN.exec(value.trim());
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] ?? 0);
  if (hours > 23 || minutes > 59 || seconds > 59) return null;

  const ref = base ?? TIME_REFERENCE;
  const date = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), hours, minutes, seconds);
  return isValid(date) ? date : null;
}

/** Parses a Postgres `DATE` column ("YYYY-MM-DD") as a *local* date (avoids UTC off-by-one). */
function toLocalDate(value: unknown): Date | null {
  if (typeof value !== 'string') return null;

  const match = DATE_PATTERN.exec(value.trim());
  if (!match) return null;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return isValid(date) ? date : null;
}

function formatShiftLabel(shift: any): string {
  const day = toLocalDate(shift?.shift_date);
  const start = toTimeDate(shift?.start_time, day);
  const end = toTimeDate(shift?.end_time, day);

  if (!start || !end) {
    return shift?.name || 'Shift';
  }

  return `${format(start, 'MMM dd, h:mm a')} - ${format(end, 'h:mm a')}`;
}

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
                {formatShiftLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
