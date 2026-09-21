'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function DashboardFilters() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-lg border">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" className="h-8">Today</Button>
        <Button variant="ghost" size="sm" className="h-8">Yesterday</Button>
        <Button variant="ghost" size="sm" className="h-8">Last 7 Days</Button>
        <Button variant="ghost" size="sm" className="h-8">Last 30 Days</Button>
        <Button variant="outline" size="sm" className="h-8">Custom Range</Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select defaultValue="all">
          <SelectTrigger className="h-8 w-[130px]">
            <SelectValue placeholder="Fuel Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fuels</SelectItem>
            <SelectItem value="petrol92">Petrol Octane 92</SelectItem>
            <SelectItem value="petrol95">Petrol Octane 95</SelectItem>
            <SelectItem value="diesel">Auto Diesel</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="h-8 w-[100px]">
            <SelectValue placeholder="Pump" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pumps</SelectItem>
            <SelectItem value="p1">Pump 1</SelectItem>
            <SelectItem value="p2">Pump 2</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="h-8 w-[120px]">
            <SelectValue placeholder="Shift" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Shifts</SelectItem>
            <SelectItem value="morning">Morning</SelectItem>
            <SelectItem value="evening">Evening</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
