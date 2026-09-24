import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth-helpers';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'STATUS_CHANGE'
  | 'CONFIRM'
  | 'CANCEL'
  | 'EXPORT';

export type AuditModule =
  | 'Fuel'
  | 'Fuel Prices'
  | 'Tanks'
  | 'Tank Calibration'
  | 'Tank Readings'
  | 'Pumps'
  | 'Nozzles'
  | 'Pump Readings'
  | 'Employees'
  | 'Shifts'
  | 'Transactions'
  | 'Suppliers'
  | 'Deliveries'
  | 'Inventory'
  | 'Expenses'
  | 'Maintenance'
  | 'Incidents'
  | 'Reports';

export interface CreateAuditLogParams {
  action: AuditAction;
  module: AuditModule;
  recordId: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  userId?: string;
}

const SENSITIVE_KEYS = [
  'password',
  'password_hash',
  'token',
  'secret',
  'service_role_key',
  'supabase_key',
  'api_key',
  'auth_token',
  'confirm_password',
  'access_token',
  'refresh_token',
];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sanitizeData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive));

    if (isSensitive) {
      cleaned[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      cleaned[key] = sanitizeData(value);
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

/**
 * Server-side helper to create an audit log entry.
 * Automatically resolves current user identity if not passed.
 * Sanitizes sensitive key-value pairs before storing.
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    let userId = params.userId;

    if (!userId) {
      const user = await getCurrentUser();
      if (user) {
        userId = user.id;
      }
    }

    let recordId = params.recordId;
    if (!recordId || !UUID_REGEX.test(recordId)) {
      if (userId && UUID_REGEX.test(userId)) {
        recordId = userId;
      } else {
        recordId = '00000000-0000-0000-0000-000000000000';
      }
    }

    const supabase = await createClient();
    const { error } = await supabase.from('audit_logs').insert({
      user_id: userId || null,
      action: params.action,
      module: params.module,
      record_id: recordId,
      old_value: sanitizeData(params.oldValue) ?? null,
      new_value: sanitizeData(params.newValue) ?? null,
    });

    if (error) {
      console.error('[createAuditLog] Error writing audit log record:', error.message);
    }
  } catch (err) {
    console.error('[createAuditLog] Exception while creating audit log:', err);
  }
}
