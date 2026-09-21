'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

const data = [
  { name: 'Petrol 92', value: 4500 },
  { name: 'Petrol 95', value: 2800 },
  { name: 'Auto Diesel', value: 6200 },
  { name: 'Super Diesel', value: 1800 },
];

export function FuelSalesChart() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Fuel Sold by Type</CardTitle>
        <CardDescription>Volume sold today (Liters)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
              <XAxis 
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                dataKey="name" 
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                width={80}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`${value} L`, 'Volume']}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
              />
              <Bar 
                dataKey="value" 
                fill="hsl(var(--primary))" 
                radius={[0, 4, 4, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
