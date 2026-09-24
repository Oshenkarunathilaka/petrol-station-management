import { requirePermission } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { AuditLogTable } from '@/components/audit/audit-log-table';
import { AuditLogFilters } from '@/components/audit/audit-log-filters';
import { AuditLogItem, AuditLogUserProfile } from '@/types/audit';
import { ShieldCheck, History, Activity, AlertCircle } from 'lucide-react';

interface AuditLogsPageProps {
  searchParams: Promise<{
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
    action?: string;
    module?: string;
    recordId?: string;
  }>;
}

export const metadata = {
  title: 'Audit Logs | Petrol Station Management System',
  description: 'View system audit trails, user operations, and data changes.',
};

export default async function AuditLogsPage({ searchParams }: AuditLogsPageProps) {
  // 1. RBAC Check
  await requirePermission('/dashboard/audit-logs');

  const resolvedParams = await searchParams;
  const supabase = await createClient();

  // 2. Fetch profiles for user filter dropdown
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .order('full_name', { ascending: true });

  const userProfiles: AuditLogUserProfile[] = (profiles || []).map((p: any) => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
  }));

  // 3. Build query for audit logs
  let query = supabase
    .from('audit_logs')
    .select(
      `
      id,
      user_id,
      action,
      module,
      record_id,
      old_value,
      new_value,
      created_at,
      user:profiles!audit_logs_user_id_fkey(id, full_name, email)
    `
    )
    .order('created_at', { ascending: false });

  if (resolvedParams.dateFrom) {
    query = query.gte('created_at', `${resolvedParams.dateFrom}T00:00:00.000Z`);
  }
  if (resolvedParams.dateTo) {
    query = query.lte('created_at', `${resolvedParams.dateTo}T23:59:59.999Z`);
  }
  if (resolvedParams.userId && resolvedParams.userId !== 'ALL') {
    query = query.eq('user_id', resolvedParams.userId);
  }
  if (resolvedParams.action && resolvedParams.action !== 'ALL') {
    query = query.eq('action', resolvedParams.action);
  }
  if (resolvedParams.module && resolvedParams.module !== 'ALL') {
    query = query.eq('module', resolvedParams.module);
  }
  if (resolvedParams.recordId) {
    query = query.eq('record_id', resolvedParams.recordId);
  }

  const { data: rawLogs, error } = await query.limit(200);

  if (error) {
    console.error('Error fetching audit logs:', error.message);
  }

  const logs: AuditLogItem[] = (rawLogs || []).map((item: any) => {
    // Supabase relation returns user as object or array
    const userObj = Array.isArray(item.user) ? item.user[0] : item.user;
    return {
      id: item.id,
      user_id: item.user_id,
      action: item.action,
      module: item.module,
      record_id: item.record_id,
      old_value: item.old_value,
      new_value: item.new_value,
      created_at: item.created_at,
      user: userObj
        ? {
            id: userObj.id,
            full_name: userObj.full_name,
            email: userObj.email,
          }
        : null,
    };
  });

  // Calculate summary stats
  const totalCount = logs.length;
  const createCount = logs.filter((l) => l.action === 'CREATE').length;
  const updateCount = logs.filter((l) => l.action === 'UPDATE').length;
  const deleteCount = logs.filter((l) => l.action === 'DELETE').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-primary" /> System Audit Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Immutable operational records and change history across all station modules.
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-card rounded-xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Displayed</p>
            <p className="text-2xl font-bold mt-1">{totalCount}</p>
          </div>
          <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
            <History className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-card rounded-xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Create Operations</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {createCount}
            </p>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-card rounded-xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Update Operations</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{updateCount}</p>
          </div>
          <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-card rounded-xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Delete Operations</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{deleteCount}</p>
          </div>
          <div className="p-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <AuditLogFilters users={userProfiles} />

      {/* Audit Table */}
      <AuditLogTable logs={logs} />
    </div>
  );
}
