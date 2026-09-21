import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fuel } from 'lucide-react';

const pumps = [
  { id: 1, name: 'Pump 1', status: 'ACTIVE', fuelTypes: ['Petrol 92', 'Diesel'] },
  { id: 2, name: 'Pump 2', status: 'ACTIVE', fuelTypes: ['Petrol 95', 'Super Diesel'] },
  { id: 3, name: 'Pump 3', status: 'MAINTENANCE', fuelTypes: ['Petrol 92'] },
  { id: 4, name: 'Pump 4', status: 'OFFLINE', fuelTypes: ['Diesel'] },
];

export function PumpStatus() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Pump Status</CardTitle>
        <CardDescription>Current operational state of all pumps</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pumps.map((pump) => (
            <div key={pump.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  pump.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 
                  pump.status === 'MAINTENANCE' ? 'bg-amber-100 text-amber-600' : 
                  'bg-muted text-muted-foreground'
                }`}>
                  <Fuel className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">{pump.name}</p>
                  <p className="text-xs text-muted-foreground">{pump.fuelTypes.join(', ')}</p>
                </div>
              </div>
              <Badge 
                variant={
                  pump.status === 'ACTIVE' ? 'default' : 
                  pump.status === 'MAINTENANCE' ? 'secondary' : 'outline'
                }
                className={
                  pump.status === 'ACTIVE' ? 'bg-emerald-500 hover:bg-emerald-600' : 
                  pump.status === 'MAINTENANCE' ? 'bg-amber-500 text-white hover:bg-amber-600' : ''
                }
              >
                {pump.status.toLowerCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
