import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Wrench, PackageMinus, BadgeDollarSign, ShieldAlert } from 'lucide-react';

const alerts = [
  {
    id: 1,
    type: 'low_stock',
    title: 'Low Fuel Stock',
    description: 'Tank 2 (Petrol 95) is below 15% capacity.',
    time: '10 mins ago',
    icon: PackageMinus,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100',
  },
  {
    id: 2,
    type: 'maintenance',
    title: 'Pump Maintenance',
    description: 'Pump 3 requires scheduled filter replacement.',
    time: '1 hour ago',
    icon: Wrench,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
  },
  {
    id: 3,
    type: 'variance',
    title: 'Stock Variance Alert',
    description: 'Discrepancy of 25L detected in Tank 1 vs Pump sales.',
    time: '2 hours ago',
    icon: AlertTriangle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
  {
    id: 4,
    type: 'cash',
    title: 'Cash Variance',
    description: 'Morning shift reported $45 short.',
    time: '4 hours ago',
    icon: BadgeDollarSign,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
  {
    id: 5,
    type: 'incident',
    title: 'Reported Incident',
    description: 'Minor fuel spill near Pump 1 (Resolved).',
    time: '1 day ago',
    icon: ShieldAlert,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
  },
];

export function OperationalAlerts() {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Operational Alerts</CardTitle>
        <CardDescription>Recent system notifications and issues requiring attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
              <div className={`mt-0.5 p-2 rounded-full ${alert.bgColor} ${alert.color}`}>
                <alert.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{alert.title}</p>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
