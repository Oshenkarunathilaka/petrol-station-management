import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, XCircle, ArrowUp, ArrowDown, Minus, AlertTriangle } from 'lucide-react';

export function MaintenanceStatusBadge({ status }: { status: string }) {
  const normalizedStatus = status?.toUpperCase() || 'PENDING';

  switch (normalizedStatus) {
    case 'PENDING':
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    case 'IN_PROGRESS':
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
          <AlertCircle className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="outline" className="text-slate-600 border-slate-200 bg-slate-50">
          <XCircle className="w-3 h-3 mr-1" />
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function MaintenancePriorityBadge({ priority }: { priority: string }) {
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
