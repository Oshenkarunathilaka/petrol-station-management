import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  description?: string;
}

export function KpiCard({ title, value, icon: Icon, trend, trendValue, description }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs mt-1">
          {trend && trendValue && (
            <span
              className={`mr-2 font-medium ${
                trend === 'up'
                  ? 'text-emerald-600'
                  : trend === 'down'
                  ? 'text-destructive'
                  : 'text-muted-foreground'
              }`}
            >
              {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
              {trendValue}
            </span>
          )}
          {description && <span className="text-muted-foreground">{description}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
