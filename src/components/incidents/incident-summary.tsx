/* eslint-disable */
import { KpiCard } from '@/components/dashboard/kpi-card';
import { AlertCircle, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface IncidentSummaryProps {
  incidents: any[];
}

export function IncidentSummary({ incidents }: IncidentSummaryProps) {
  const open = incidents.filter((i) => i.status === 'OPEN').length;
  const critical = incidents.filter((i) => i.priority === 'CRITICAL' && i.status !== 'CLOSED' && i.status !== 'RESOLVED').length;
  const highPriority = incidents.filter((i) => i.priority === 'HIGH' && i.status !== 'CLOSED' && i.status !== 'RESOLVED').length;
  
  const sevenDaysAgo = subDays(new Date(), 7);
  const recentlyResolved = incidents.filter((i) => {
    if (i.status !== 'RESOLVED' && i.status !== 'CLOSED') return false;
    if (!i.resolved_date) return false;
    return new Date(i.resolved_date) >= sevenDaysAgo;
  }).length;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Open Incidents"
        value={open.toString()}
        icon={AlertCircle}
        trend={open > 0 ? 'down' : 'neutral'}
        trendValue={open > 0 ? 'Needs review' : 'All clear'}
      />
      <KpiCard
        title="Critical"
        value={critical.toString()}
        icon={ShieldAlert}
        trend={critical > 0 ? 'down' : 'neutral'}
        trendValue={critical > 0 ? 'Immediate action required' : 'None active'}
      />
      <KpiCard
        title="High Priority"
        value={highPriority.toString()}
        icon={Clock}
      />
      <KpiCard
        title="Resolved (Last 7 Days)"
        value={recentlyResolved.toString()}
        icon={CheckCircle2}
        trend="up"
        trendValue="Recently closed"
      />
    </div>
  );
}
