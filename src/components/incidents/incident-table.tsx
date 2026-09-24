/* eslint-disable */
// @ts-nocheck
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { IncidentStatusBadge, IncidentPriorityBadge, formatIncidentType } from './incident-status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, Search } from 'lucide-react';

interface IncidentTableProps {
  incidents: any[];
}

export function IncidentTable({ incidents }: IncidentTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filtered = incidents.filter((i) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      i.location.toLowerCase().includes(searchLower) || 
      i.description.toLowerCase().includes(searchLower);
      
    const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || i.priority === priorityFilter;
    const matchesType = typeFilter === 'ALL' || i.incident_type === typeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by location or description..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="INVESTIGATING">Investigating</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priority</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="FUEL_LEAKAGE_SPILL">Fuel Leakage/Spill</SelectItem>
              <SelectItem value="PUMP_FAILURE">Pump Failure</SelectItem>
              <SelectItem value="EQUIPMENT_DAMAGE">Equipment Damage</SelectItem>
              <SelectItem value="POWER_FAILURE">Power Failure</SelectItem>
              <SelectItem value="CASH_DISCREPANCY">Cash Discrepancy</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No incidents found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">
                    {formatIncidentType(i.incident_type)}
                  </TableCell>
                  <TableCell>{i.location}</TableCell>
                  <TableCell>
                    <IncidentPriorityBadge priority={i.priority} />
                  </TableCell>
                  <TableCell>
                    <IncidentStatusBadge status={i.status} />
                  </TableCell>
                  <TableCell>
                    {i.reporter?.full_name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(i.incident_date), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/incidents/${i.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
