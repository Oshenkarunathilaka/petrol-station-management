/* eslint-disable */
import { KpiCard } from '@/components/dashboard/kpi-card';
import { Wrench, Clock, CheckCircle2, AlertTriangle, DollarSign } from 'lucide-react';

interface MaintenanceSummaryProps {
  maintenance: any[];
}

export function MaintenanceSummary({ maintenance }: MaintenanceSummaryProps) {
  const pending = maintenance.filter((m) => m.status === 'PENDING').length;
  const inProgress = maintenance.filter((m) => m.status === 'IN_PROGRESS').length;
  const completed = maintenance.filter((m) => m.status === 'COMPLETED').length;
  const critical = maintenance.filter((m) => m.priority === 'CRITICAL' && m.status !== 'COMPLETED' && m.status !== 'CANCELLED').length;
  
  const totalCost = maintenance
    .filter((m) => m.status === 'COMPLETED')
    .reduce((sum, m) => sum + (Number(m.cost) || 0), 0);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
      <KpiCard
        title="Pending"
        value={pending.toString()}
        icon={Clock}
      />
      <KpiCard
        title="In Progress"
        value={inProgress.toString()}
        icon={Wrench}
      />
      <KpiCard
        title="Completed"
        value={completed.toString()}
        icon={CheckCircle2}
      />
      <KpiCard
        title="Critical Issues"
        value={critical.toString()}
        icon={AlertTriangle}
        trend={critical > 0 ? 'down' : 'neutral'}
        trendValue={critical > 0 ? 'Requires attention' : 'All good'}
      />
      <KpiCard
        title="Total Cost (Completed)"
        value={`$${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        icon={DollarSign}
      />
    </div>
  );
}
