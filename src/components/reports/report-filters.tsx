/* eslint-disable */
// @ts-nocheck
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { startOfDay, endOfDay, subDays, startOfMonth, format } from 'date-fns';

export interface ReportFilters {
  startDate: string;
  endDate: string;
  preset: string;
}

interface ReportFilterProps {
  onFilterChange: (filters: ReportFilters) => void;
  isLoading: boolean;
}

export function ReportFiltersBar({ onFilterChange, isLoading }: ReportFilterProps) {
  const [preset, setPreset] = useState('LAST_7_DAYS');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const handlePresetChange = (value: string) => {
    setPreset(value);
    
    let start = new Date();
    let end = new Date();

    switch (value) {
      case 'TODAY':
        start = startOfDay(new Date());
        end = endOfDay(new Date());
        break;
      case 'YESTERDAY':
        start = startOfDay(subDays(new Date(), 1));
        end = endOfDay(subDays(new Date(), 1));
        break;
      case 'LAST_7_DAYS':
        start = startOfDay(subDays(new Date(), 7));
        end = endOfDay(new Date());
        break;
      case 'LAST_30_DAYS':
        start = startOfDay(subDays(new Date(), 30));
        end = endOfDay(new Date());
        break;
      case 'THIS_MONTH':
        start = startOfMonth(new Date());
        end = endOfDay(new Date());
        break;
    }

    if (value !== 'CUSTOM') {
      onFilterChange({
        preset: value,
        startDate: start.toISOString(),
        endDate: end.toISOString()
      });
    }
  };

  const applyCustomFilter = () => {
    if (!customStart || !customEnd) return;
    onFilterChange({
      preset: 'CUSTOM',
      startDate: startOfDay(new Date(customStart)).toISOString(),
      endDate: endOfDay(new Date(customEnd)).toISOString()
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end bg-card p-4 rounded-lg border">
      <div className="space-y-2 w-full sm:w-auto">
        <label className="text-sm font-medium">Date Range</label>
        <Select value={preset} onValueChange={handlePresetChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODAY">Today</SelectItem>
            <SelectItem value="YESTERDAY">Yesterday</SelectItem>
            <SelectItem value="LAST_7_DAYS">Last 7 Days</SelectItem>
            <SelectItem value="LAST_30_DAYS">Last 30 Days</SelectItem>
            <SelectItem value="THIS_MONTH">This Month</SelectItem>
            <SelectItem value="CUSTOM">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {preset === 'CUSTOM' && (
        <>
          <div className="space-y-2 w-full sm:w-auto">
            <label className="text-sm font-medium">Start Date</label>
            <Input 
              type="date" 
              value={customStart} 
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full sm:w-auto"
            />
          </div>
          <div className="space-y-2 w-full sm:w-auto">
            <label className="text-sm font-medium">End Date</label>
            <Input 
              type="date" 
              value={customEnd} 
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full sm:w-auto"
            />
          </div>
          <Button onClick={applyCustomFilter} disabled={!customStart || !customEnd || isLoading}>
            Apply
          </Button>
        </>
      )}
    </div>
  );
}
