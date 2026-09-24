/* eslint-disable */
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
    <Card className="relative overflow-hidden border border-border/60 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      {/* Maroon accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary rounded-t-lg" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground tracking-tight">{value}</div>
        <div className="flex items-center gap-1 text-xs mt-2">
          {trend && trendValue && (
            <span
              className={`flex items-center gap-0.5 font-semibold ${
                trend === 'up'
                  ? 'text-emerald-600'
                  : trend === 'down'
                  ? 'text-destructive'
                  : 'text-muted-foreground'
              }`}
            >
              {trend === 'up' ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : trend === 'down' ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : null}
              {trendValue}
            </span>
          )}
          {description && <span className="text-muted-foreground">{description}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
