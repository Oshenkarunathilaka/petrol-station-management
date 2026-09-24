/* eslint-disable */
// @ts-nocheck
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Droplet, Fuel, Calculator, Save, User, TrendingUp, Loader2, Settings2 } from 'lucide-react';
import { updateFuelPrice, submitPumpReading } from './actions';

interface FuelType {
  id: string;
  name: string;
  code: string;
  price: number;
}

interface Employee {
  id: string;
  full_name: string;
  employee_code: string;
}

interface Nozzle {
  id: string;
  nozzle_number: number;
  fuel_type_id: string;
  last_meter: number;
}

interface Pump {
  id: string;
  pump_number: string;
  nozzles: Nozzle[];
}

export default function DailyEntryClient({
  fuelTypes,
  employees,
  pumps
}: {
  fuelTypes: FuelType[];
  employees: Employee[];
  pumps: Pump[];
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form states for Fuel Price Update
  const [selectedFuelTypeForPrice, setSelectedFuelTypeForPrice] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');

  // Form states for Pump Reading
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedPump, setSelectedPump] = useState<string>('');
  const [selectedNozzle, setSelectedNozzle] = useState<string>('');
  const [openingMeter, setOpeningMeter] = useState<string>('');
  const [closingMeter, setClosingMeter] = useState<string>('');
  const [actualMoney, setActualMoney] = useState<string>('');

  const activePump = pumps.find(p => p.id === selectedPump);
  const activeNozzle = activePump?.nozzles.find(n => n.id === selectedNozzle);
  const activeFuelType = fuelTypes.find(f => f.id === activeNozzle?.fuel_type_id);

  const calculateSales = () => {
    const open = parseFloat(openingMeter) || 0;
    const close = parseFloat(closingMeter) || 0;
    const liters = Math.max(0, close - open);
    const price = activeFuelType?.price || 0;
    const expected = liters * price;
    const actual = parseFloat(actualMoney) || 0;
    const difference = actual - expected;

    return {
      liters,
      expected,
      actual,
      difference
    };
  };

  const handlePumpSelect = (pumpId: string) => {
    setSelectedPump(pumpId);
    setSelectedNozzle('');
    setOpeningMeter('');
    setClosingMeter('');
  };

  const handleNozzleSelect = (nozzleId: string) => {
    setSelectedNozzle(nozzleId);
    const nozzle = activePump?.nozzles.find(n => n.id === nozzleId);
    if (nozzle) {
      setOpeningMeter(nozzle.last_meter.toString());
    }
  };

  const handleUpdatePrice = async () => {
    if (!selectedFuelTypeForPrice || !newPrice) {
      toast({ title: 'Error', description: 'Please select a fuel type and enter a new price', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    const res = await updateFuelPrice(selectedFuelTypeForPrice, parseFloat(newPrice));
    setLoading(false);

    if (res.success) {
      toast({ title: 'Success', description: 'Fuel price updated successfully!' });
      setNewPrice('');
      setSelectedFuelTypeForPrice('');
    } else {
      toast({ title: 'Error', description: res.error, variant: 'destructive' });
    }
  };

  const handleSubmitReading = async () => {
    if (!selectedEmployee || !selectedPump || !selectedNozzle || !openingMeter || !closingMeter || !actualMoney) {
      toast({ title: 'Error', description: 'Please fill out all reading fields', variant: 'destructive' });
      return;
    }

    const stats = calculateSales();

    setLoading(true);
    const res = await submitPumpReading({
      employeeId: selectedEmployee,
      pumpId: selectedPump,
      nozzleId: selectedNozzle,
      fuelTypeId: activeFuelType!.id,
      opening: parseFloat(openingMeter),
      closing: parseFloat(closingMeter),
      expectedMoney: stats.expected,
      collectedMoney: stats.actual
    });
    setLoading(false);

    if (res.success) {
      toast({ title: 'Success', description: 'Pump reading and sales recorded successfully!' });
      // Reset form
      setClosingMeter('');
      setActualMoney('');
      setSelectedNozzle('');
    } else {
      toast({ title: 'Error', description: res.error, variant: 'destructive' });
    }
  };

  const stats = calculateSales();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* LEFT COLUMN: FUEL PRICE */}
      <div className="space-y-6">
        <Card className="border-t-4 border-t-primary shadow-lg overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader className="bg-primary/5 pb-6">
            <CardTitle className="flex items-center text-xl gap-2 text-primary">
              <TrendingUp className="h-5 w-5" />
              Update Fuel Price
            </CardTitle>
            <CardDescription>
              Set the current selling price per liter for any fuel type.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Select Fuel Type</Label>
              <Select value={selectedFuelTypeForPrice} onValueChange={setSelectedFuelTypeForPrice}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose Fuel Type" />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypes.map((ft) => (
                    <SelectItem key={ft.id} value={ft.id}>
                      <div className="flex justify-between w-full pr-4">
                        <span>{ft.name}</span>
                        <span className="text-muted-foreground ml-4">Current: Rs. {ft.price.toLocaleString()}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>New Price (Rs. per Liter)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">Rs.</span>
                <Input 
                  type="number" 
                  className="pl-10" 
                  placeholder="e.g. 300"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                />
              </div>
            </div>

            <Button 
              className="w-full shadow-md hover:shadow-lg transition-all mt-4" 
              onClick={handleUpdatePrice}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {loading ? 'Updating...' : 'Update Price'}
            </Button>
          </CardContent>
        </Card>

        {/* SUMMARY CARD */}
        <Card className="shadow-md bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-none">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Droplet className="h-5 w-5 text-blue-500" /> Current Active Prices
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {fuelTypes.map(ft => (
              <div key={ft.id} className="bg-white dark:bg-slate-950 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center text-center">
                <p className="text-sm font-medium text-slate-500 mb-1">{ft.name}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">Rs. {ft.price}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: PUMP READING & SALES */}
      <Card className="border-t-4 border-t-blue-500 shadow-xl overflow-hidden bg-white dark:bg-slate-900 relative">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Fuel className="h-32 w-32" />
        </div>
        <CardHeader className="bg-blue-500/5 pb-6">
          <CardTitle className="flex items-center text-xl gap-2 text-blue-600 dark:text-blue-400">
            <Fuel className="h-5 w-5" />
            Pump Reading & Sales
          </CardTitle>
          <CardDescription>
            Record daily opening/closing meter, employee, and collected cash.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground"/> Pumpman</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Fuel className="h-4 w-4 text-muted-foreground"/> Pump</Label>
              <Select value={selectedPump} onValueChange={handlePumpSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Pump" />
                </SelectTrigger>
                <SelectContent>
                  {pumps.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.pump_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {activePump && activePump.nozzles.length > 0 && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label>Nozzle (Fuel Type)</Label>
              <Select key={activePump.id} value={selectedNozzle} onValueChange={handleNozzleSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Nozzle" />
                </SelectTrigger>
                <SelectContent>
                  {activePump.nozzles.map((n) => {
                    const ft = fuelTypes.find(f => f.id === n.fuel_type_id);
                    return (
                      <SelectItem key={n.id} value={n.id}>
                        Nozzle {n.nozzle_number} - {ft?.name ?? 'Unknown fuel type'} (Rs. {ft?.price ?? 0}/L)
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {activePump && activePump.nozzles.length === 0 && (
            <div className="rounded-lg border border-dashed bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300">
              <div className="flex items-start gap-3">
                <Settings2 className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="space-y-2">
                  <p className="font-medium">No active nozzles configured for {activePump.pump_number}.</p>
                  <p className="text-sm">
                    Add a nozzle and assign its fuel type before recording a pump reading.
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/pumps/${activePump.id}`}>
                      Manage nozzles
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeNozzle && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="space-y-2">
                <Label>Opening Meter</Label>
                <Input 
                  type="number" 
                  placeholder="e.g. 10000" 
                  value={openingMeter}
                  onChange={(e) => setOpeningMeter(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Closing Meter</Label>
                <Input 
                  type="number" 
                  placeholder="e.g. 10150"
                  value={closingMeter}
                  onChange={(e) => setClosingMeter(e.target.value)}
                />
              </div>
            </div>
          )}

          {activeNozzle && closingMeter && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-4 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Litres Sold:</span>
                <span className="font-bold text-lg">{stats.liters.toFixed(2)} L</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Price per Litre:</span>
                <span>Rs. {activeFuelType?.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-3">
                <span className="font-semibold">Expected Money:</span>
                <span className="font-bold text-xl text-emerald-600 dark:text-emerald-400">
                  Rs. {stats.expected.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {activeNozzle && closingMeter && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <Label>Actual Money Collected (Rs.)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-emerald-600 font-bold">Rs.</span>
                  <Input 
                    type="number" 
                    className="pl-10 border-emerald-200 focus-visible:ring-emerald-500 text-lg" 
                    placeholder="Enter amount handed over"
                    value={actualMoney}
                    onChange={(e) => setActualMoney(e.target.value)}
                  />
                </div>
              </div>

              {actualMoney && (
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  stats.difference === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-900 dark:text-emerald-400' 
                  : stats.difference < 0 ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/50 dark:border-red-900 dark:text-red-400'
                  : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/50 dark:border-amber-900 dark:text-amber-400'
                }`}>
                  <div className="flex items-center gap-2 font-semibold">
                    <Calculator className="h-5 w-5" />
                    Difference:
                  </div>
                  <div className="text-xl font-bold">
                    {stats.difference > 0 ? '+' : ''}Rs. {stats.difference.toLocaleString()}
                  </div>
                </div>
              )}

              <Button 
                className="w-full h-12 text-lg shadow-lg hover:shadow-xl transition-all" 
                onClick={handleSubmitReading}
                disabled={loading || !actualMoney}
              >
                <Save className="h-5 w-5 mr-2" />
                Submit Daily Record
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
