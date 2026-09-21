'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Cash', value: 45 },
  { name: 'Card', value: 35 },
  { name: 'QR/Mobile', value: 15 },
  { name: 'Corporate', value: 5 },
];

const COLORS = [
  'hsl(var(--primary))', 
  'hsl(var(--primary) / 0.7)', 
  'hsl(var(--primary) / 0.5)', 
  'hsl(var(--primary) / 0.3)'
];

export function PaymentChart() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Distribution of transaction types</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`${value}%`, 'Usage']}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
