'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function TankStockTable({ data }: { data: Record<string, any>[] }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No tank data available.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tank</TableHead>
            <TableHead>Fuel</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Opening Stock</TableHead>
            <TableHead>Deliveries</TableHead>
            <TableHead>Fuel Sold</TableHead>
            <TableHead>Expected Closing</TableHead>
            <TableHead>Physical Stock</TableHead>
            <TableHead>Variance</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((tank) => {
            const recon = tank.latestReconciliation;
            const variance = recon ? Number(recon.variance) : 0;
            const opening = recon ? Number(recon.opening_stock) : 0;
            const deliveries = recon ? Number(recon.confirmed_deliveries) : 0;
            const sold = recon ? Number(recon.fuel_sold) : 0;
            const expected = recon ? Number(recon.expected_closing_stock) : 0;
            
            return (
              <TableRow key={tank.id}>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/stock/${tank.id}`} className="hover:underline text-primary">
                    {tank.tank_number}
                  </Link>
                </TableCell>
                <TableCell>{tank.fuel_type || '-'}</TableCell>
                <TableCell>{Number(tank.capacity).toLocaleString()} L</TableCell>
                <TableCell>{recon ? opening.toLocaleString() + ' L' : '-'}</TableCell>
                <TableCell>{recon ? deliveries.toLocaleString() + ' L' : '-'}</TableCell>
                <TableCell>{recon ? sold.toLocaleString() + ' L' : '-'}</TableCell>
                <TableCell>{recon ? expected.toLocaleString() + ' L' : '-'}</TableCell>
                <TableCell>{tank.physical_stock ? Number(tank.physical_stock).toLocaleString() + ' L' : '-'}</TableCell>
                <TableCell>
                  {!recon ? '-' : (
                    <Badge variant={variance > 0 ? "default" : variance < 0 ? "destructive" : "secondary"}>
                      {variance > 0 ? '+' : ''}{variance.toLocaleString()} L
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={tank.status === 'ACTIVE' ? "default" : "secondary"}>
                    {tank.status}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
