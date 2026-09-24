import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Wrench, PackageMinus, BadgeDollarSign, ShieldAlert } from 'lucide-react';

interface OperationalAlertsProps {
  alerts: {
    id: string;
    type: 'warning' | 'critical' | 'info';
    title: string;
    message: string;
    time: string;
  }[];
}

export function OperationalAlerts({ alerts }: OperationalAlertsProps) {
  const getAlertConfig = (type: string) => {
    switch (type) {
      case 'warning':
        return { icon: PackageMinus, color: 'text-amber-500', bgColor: 'bg-amber-100' };
      case 'critical':
        return { icon: AlertTriangle, color: 'text-destructive', bgColor: 'bg-destructive/10' };
      case 'info':
      default:
        return { icon: Wrench, color: 'text-blue-500', bgColor: 'bg-blue-100' };
    }
  };

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Operational Alerts</CardTitle>
        <CardDescription>Recent system notifications and issues requiring attention</CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No active alerts at the moment.
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const config = getAlertConfig(alert.type);
              const Icon = config.icon;
              return (
                <div key={alert.id} className="flex items-start gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className={`mt-0.5 p-2 rounded-full ${config.bgColor} ${config.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
