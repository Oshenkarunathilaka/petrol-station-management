'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AuditLogItem } from '@/types/audit';
import { format } from 'date-fns';
import { Eye, ShieldAlert } from 'lucide-react';
import { AuditLogDetailModal } from './audit-log-detail-modal';

interface AuditLogTableProps {
  logs: AuditLogItem[];
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  const [selectedLog, setSelectedLog] = React.useState<AuditLogItem | null>(null);

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'UPDATE':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'LOGIN':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'LOGOUT':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'STATUS_CHANGE':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      case 'CONFIRM':
        return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
      case 'CANCEL':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'EXPORT':
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  const renderValuePreview = (val: Record<string, any> | null) => {
    if (!val || Object.keys(val).length === 0) {
      return <span className="text-muted-foreground italic text-xs">-</span>;
    }
    const keys = Object.keys(val);
    const summary = keys.slice(0, 2).map((k) => `${k}: ${String(val[k])}`).join(', ');
    const extra = keys.length > 2 ? ` (+${keys.length - 2} more)` : '';
    return (
      <span className="font-mono text-xs text-muted-foreground truncate max-w-[150px] inline-block" title={JSON.stringify(val)}>
        {summary}{extra}
      </span>
    );
  };

  return (
    <>
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[160px]">Date/Time</TableHead>
              <TableHead className="w-[180px]">User</TableHead>
              <TableHead className="w-[120px]">Action</TableHead>
              <TableHead className="w-[140px]">Module</TableHead>
              <TableHead className="w-[140px]">Record ID</TableHead>
              <TableHead className="min-w-[150px]">Old Value</TableHead>
              <TableHead className="min-w-[150px]">New Value</TableHead>
              <TableHead className="w-[80px] text-right">Inspect</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldAlert className="w-8 h-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium">No audit log records found matching the specified filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="text-xs font-mono font-medium whitespace-nowrap">
                    {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    <div className="flex flex-col">
                      <span className="truncate max-w-[160px]">
                        {log.user?.full_name || log.user?.email || 'System / Unauthenticated'}
                      </span>
                      {log.user?.email && log.user?.full_name && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">
                          {log.user.email}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getActionBadgeColor(log.action)} font-semibold text-[10px] px-2 py-0.5`}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    <Badge variant="outline" className="text-[10px]">
                      {log.module}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    <span className="truncate inline-block max-w-[120px]" title={log.record_id}>
                      {log.record_id}
                    </span>
                  </TableCell>
                  <TableCell>{renderValuePreview(log.old_value)}</TableCell>
                  <TableCell>{renderValuePreview(log.new_value)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary hover:bg-primary/10"
                      onClick={() => setSelectedLog(log)}
                      title="Inspect record details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AuditLogDetailModal
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </>
  );
}
