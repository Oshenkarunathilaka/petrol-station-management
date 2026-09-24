/* eslint-disable */
// @ts-nocheck
import { getTankReconciliations } from '../actions';
import { TankHistoryTable } from '@/components/stock/tank-history-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function TankStockHistoryPage({ params }: { params: { tank: string } }) {
  const supabase = await createClient();
  const tankId = params.tank;

  const { data: tankInfo } = await supabase
    .from('tanks')
    .select('tank_number, fuel_types(name)')
    .eq('id', tankId)
    .single();

  const reconciliations = await getTankReconciliations(tankId);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/stock">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tank Stock History</h2>
          <p className="text-muted-foreground">
            {tankInfo ? `${tankInfo.tank_number} (${tankInfo.fuel_types?.name})` : 'Unknown Tank'}
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Reconciliation Records</CardTitle>
        </CardHeader>
        <CardContent>
          <TankHistoryTable data={reconciliations} />
        </CardContent>
      </Card>
    </div>
  );
}
