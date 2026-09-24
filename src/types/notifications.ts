/* eslint-disable */
export type NotificationKind = 'inventory' | 'incident' | 'maintenance';

export interface DashboardNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  href: string;
}
