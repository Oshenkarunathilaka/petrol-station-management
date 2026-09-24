/* eslint-disable */
// @ts-nocheck
'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { AuditLogUserProfile } from '@/types/audit';

const ACTION_TYPES = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'STATUS_CHANGE',
  'CONFIRM',
  'CANCEL',
  'EXPORT',
];

const MODULE_LIST = [
  'Fuel',
  'Fuel Prices',
  'Tanks',
  'Tank Calibration',
  'Tank Readings',
  'Pumps',
  'Nozzles',
  'Pump Readings',
  'Employees',
  'Shifts',
  'Transactions',
  'Suppliers',
  'Deliveries',
  'Inventory',
  'Expenses',
  'Maintenance',
  'Incidents',
  'Reports',
];

interface AuditLogFiltersProps {
  users: AuditLogUserProfile[];
}

export function AuditLogFilters({ users }: AuditLogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [dateFrom, setDateFrom] = React.useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = React.useState(searchParams.get('dateTo') || '');
  const [userId, setUserId] = React.useState(searchParams.get('userId') || 'ALL');
  const [action, setAction] = React.useState(searchParams.get('action') || 'ALL');
  const [module, setModule] = React.useState(searchParams.get('module') || 'ALL');
  const [recordId, setRecordId] = React.useState(searchParams.get('recordId') || '');

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    if (userId && userId !== 'ALL') params.set('userId', userId);
    if (action && action !== 'ALL') params.set('action', action);
    if (module && module !== 'ALL') params.set('module', module);
    if (recordId) params.set('recordId', recordId.trim());

    router.push(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setUserId('ALL');
    setAction('ALL');
    setModule('ALL');
    setRecordId('');
    router.push(pathname);
  };

  return (
    <div className="bg-card p-4 rounded-xl border shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" /> Filter Audit Logs
        </h3>
        <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-xs text-muted-foreground hover:text-foreground">
          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Date From */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">From Date</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        {/* Date To */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">To Date</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        {/* User Filter */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">User</label>
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Users</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.full_name || u.email || u.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Type */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Action</label>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Actions</SelectItem>
              {ACTION_TYPES.map((act) => (
                <SelectItem key={act} value={act}>
                  {act}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Module */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Module</label>
          <Select value={module} onValueChange={setModule}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Modules</SelectItem>
              {MODULE_LIST.map((mod) => (
                <SelectItem key={mod} value={mod}>
                  {mod}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Record ID */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Record ID</label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search UUID..."
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              className="h-9 text-xs pr-8 font-mono"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button size="sm" onClick={applyFilters} className="h-8 text-xs">
          <Search className="w-3.5 h-3.5 mr-1" /> Apply Filters
        </Button>
      </div>
    </div>
  );
}
