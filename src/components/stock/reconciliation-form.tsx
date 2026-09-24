/* eslint-disable */
// @ts-nocheck
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculateReconciliation, saveReconciliation } from '@/app/dashboard/stock/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function ReconciliationForm({ tanks }: { tanks: any[] }) {
  const [tankId, setTankId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [openStart, setOpenStart] = useState('');
  const [closeEnd, setCloseEnd] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    if (!tankId || !date || !openStart || !closeEnd) {
      setError('Please fill in all required fields');
      return;
    }
    setError(null);
    setResult(null);
    setIsCalculating(true);

    const formData = new FormData();
    formData.append('tank_id', tankId);
    formData.append('reconciliation_date', date);
    formData.append('opening_period_start', openStart);
    formData.append('closing_period_end', closeEnd);

    try {
      const res = await calculateReconciliation(formData);
      if (res.error) {
        setError(res.error);
        if (res.details) {
          setResult(res.details); // partial result even if error like "No physical stock"
        }
      } else {
        setResult(res.data);
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to calculate');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSave = async () => {
    if (!result || error) return;
    
    setIsSaving(true);
    const formData = new FormData();
    formData.append('tank_id', tankId);
    formData.append('reconciliation_date', date);
    formData.append('opening_period_start', openStart);
    formData.append('closing_period_end', closeEnd);
    formData.append('notes', notes);

    try {
      const res = await saveReconciliation(formData);
      if (res?.error) {
        setError(res.error);
      }
      // if successful, saveReconciliation redirects
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reconciliation Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Reconciliation Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tank</Label>
              <Select value={tankId} onValueChange={setTankId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tank" />
                </SelectTrigger>
                <SelectContent>
                  {tanks.map(tank => (
                    <SelectItem key={tank.id} value={tank.id}>
                      {tank.tank_number} ({tank.fuel_types?.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Opening Period Start</Label>
              <Input type="datetime-local" value={openStart} onChange={e => setOpenStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Closing Period End</Label>
              <Input type="datetime-local" value={closeEnd} onChange={e => setCloseEnd(e.target.value)} />
            </div>
          </div>
          
          <Button onClick={handleCalculate} disabled={isCalculating} className="w-full md:w-auto">
            {isCalculating ? 'Calculating...' : 'Calculate Variance'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Reconciliation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 border rounded-md">
                <div className="text-sm text-muted-foreground">Opening Stock</div>
                <div className="text-xl font-bold">{Number(result.openingStock).toLocaleString()} L</div>
              </div>
              <div className="p-4 border rounded-md">
                <div className="text-sm text-muted-foreground">Confirmed Deliveries</div>
                <div className="text-xl font-bold text-emerald-600">+{Number(result.confirmedDeliveries).toLocaleString()} L</div>
              </div>
              <div className="p-4 border rounded-md">
                <div className="text-sm text-muted-foreground">Fuel Sold</div>
                <div className="text-xl font-bold text-rose-600">-{Number(result.fuelSold).toLocaleString()} L</div>
              </div>
              <div className="p-4 border rounded-md bg-secondary/20">
                <div className="text-sm text-muted-foreground">Expected Closing</div>
                <div className="text-xl font-bold">{Number(result.expectedClosing).toLocaleString()} L</div>
              </div>
            </div>

            {result.physicalStock !== undefined && (
              <div className="flex flex-col md:flex-row justify-between items-center p-6 border-2 border-primary/20 rounded-lg bg-primary/5">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Physical Stock (Latest Reading)</div>
                  <div className="text-3xl font-bold">{Number(result.physicalStock).toLocaleString()} L</div>
                </div>
                
                <div className="text-center mt-4 md:mt-0">
                  <div className="text-sm font-medium mb-2">Stock Variance</div>
                  <Badge 
                    variant={result.variance > 0 ? "default" : result.variance < 0 ? "destructive" : "secondary"}
                    className="text-2xl py-2 px-4"
                  >
                    {result.variance > 0 ? '+' : ''}{Number(result.variance).toLocaleString()} L
                  </Badge>
                </div>
              </div>
            )}

            {!error && result.physicalStock !== undefined && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Input 
                    placeholder="Add any remarks for this reconciliation..." 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                  />
                </div>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving} 
                  className="w-full"
                  size="lg"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Finalize Reconciliation'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
