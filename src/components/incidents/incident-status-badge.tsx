import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, Check, ArrowUp, ArrowDown, Minus, AlertTriangle } from 'lucide-react';

export function IncidentStatusBadge({ status }: { status: string }) {
  const normalizedStatus = status?.toUpperCase() || 'OPEN';

  switch (normalizedStatus) {
    case 'OPEN':
      return (
        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
          <AlertCircle className="w-3 h-3 mr-1" />
          Open
        </Badge>
      );
    case 'INVESTIGATING':
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
          <Clock className="w-3 h-3 mr-1" />
          Investigating
        </Badge>
      );
    case 'RESOLVED':
      return (
        <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Resolved
        </Badge>
      );
    case 'CLOSED':
      return (
        <Badge variant="outline" className="text-slate-600 border-slate-200 bg-slate-50">
          <Check className="w-3 h-3 mr-1" />
          Closed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function IncidentPriorityBadge({ priority }: { priority: string }) {
  const normalizedPriority = priority?.toUpperCase() || 'MEDIUM';

  switch (normalizedPriority) {
    case 'LOW':
      return (
        <span className="flex items-center text-xs font-medium text-slate-500">
          <ArrowDown className="w-3 h-3 mr-1" />
          Low
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="flex items-center text-xs font-medium text-blue-600">
          <Minus className="w-3 h-3 mr-1" />
          Medium
        </span>
      );
    case 'HIGH':
      return (
        <span className="flex items-center text-xs font-medium text-orange-600">
          <ArrowUp className="w-3 h-3 mr-1" />
          High
        </span>
      );
    case 'CRITICAL':
      return (
        <span className="flex items-center text-xs font-bold text-destructive">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Critical
        </span>
      );
    default:
      return <span>{priority}</span>;
  }
}

export function formatIncidentType(type: string) {
  if (!type) return 'Unknown';
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
