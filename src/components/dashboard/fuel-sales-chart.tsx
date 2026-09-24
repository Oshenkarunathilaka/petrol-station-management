'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';

interface FuelSalesChartProps {
  data: { name: string; value: number; fill?: string }[];
}

export function FuelSalesChart({ data }: FuelSalesChartProps) {
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
              <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#e5e7eb" strokeOpacity={0.8} />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k L`}
              />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#374151', fontWeight: 600 }}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: '1px solid #9b1c2e40',
                  background: '#fff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
                  color: '#1a0508',
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`${value.toLocaleString()} L`, 'Volume']}
                cursor={{ fill: '#9b1c2e', opacity: 0.06 }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={30}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
