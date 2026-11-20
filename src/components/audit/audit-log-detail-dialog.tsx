'use client';
/* eslint-disable */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AuditLogItem } from '@/types/audit';
import { format } from 'date-fns';
import { User, Calendar, Tag, Database, Hash, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuditLogDetailModalProps {
  log: AuditLogItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogDetailModal = AuditLogDetailDialog;

export function AuditLogDetailDialog({ log, isOpen, onClose }: AuditLogDetailModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!log) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(log.record_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4 pr-6">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              Audit Record Details
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge className={`${getActionBadgeColor(log.action)} font-semibold`}>
                {log.action}
              </Badge>
              <Badge variant="outline" className="font-mono">
                {log.module}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/40 border">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5" /> Date & Time
              </span>
              <p className="text-sm font-medium">
                {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                <User className="w-3.5 h-3.5" /> Triggered By
              </span>
              <p className="text-sm font-medium truncate">
                {log.user?.full_name || log.user?.email || 'System / Unauthenticated'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                <Tag className="w-3.5 h-3.5" /> Module
              </span>
              <p className="text-sm font-medium">{log.module}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                <Hash className="w-3.5 h-3.5" /> Record ID
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-mono truncate max-w-[120px]">{log.record_id}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleCopyId}
                  title="Copy Record ID"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </div>

          {/* JSON Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Old Value */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <Database className="w-4 h-4" /> Old Value
                </h4>
                <span className="text-xs text-muted-foreground">
                  {log.old_value ? 'Previous State' : 'None'}
                </span>
              </div>
              <div className="bg-slate-950 text-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-[350px] border">
                {log.old_value ? (
                  <pre>{JSON.stringify(log.old_value, null, 2)}</pre>
                ) : (
                  <span className="text-slate-500 italic">No previous value</span>
                )}
              </div>
            </div>

            {/* New Value */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Database className="w-4 h-4" /> New Value
                </h4>
                <span className="text-xs text-muted-foreground">
                  {log.new_value ? 'Updated State' : 'None'}
                </span>
              </div>
              <div className="bg-slate-950 text-slate-100 dark:bg-slate-900 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-[350px] border">
                {log.new_value ? (
                  <pre>{JSON.stringify(log.new_value, null, 2)}</pre>
                ) : (
                  <span className="text-slate-500 italic">No new value</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
