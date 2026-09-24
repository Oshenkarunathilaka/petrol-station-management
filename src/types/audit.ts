/* eslint-disable */
import { AuditAction, AuditModule } from '@/lib/audit';

export interface AuditLogUserProfile {
  id: string;
  full_name: string | null;
  email?: string | null;
}

export interface AuditLogItem {
  id: string;
  user_id: string | null;
  action: AuditAction;
  module: AuditModule;
  record_id: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
  user?: AuditLogUserProfile | null;
}

export interface AuditLogFilterParams {
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  action?: string;
  module?: string;
  recordId?: string;
}

