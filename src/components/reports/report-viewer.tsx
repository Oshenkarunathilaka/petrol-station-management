'use client';
/* eslint-disable */

import { useState, useEffect } from 'react';
import { generateReport, logReportExport } from '@/app/dashboard/reports/actions';
import { exportToPDF } from '@/lib/pdf-export';
import { ReportConfig, ReportType } from '@/lib/reports/config';
import { ReportFiltersBar, ReportFilters } from './report-filters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { startOfDay, subDays, format } from 'date-fns';

export function ReportViewer({ config, userName }: { config: { id: ReportType, title: string, description: string }; userName: string }) {
  const { toast } = useToast();
  const [filters, setFilters] = useState<ReportFilters>({
    preset: 'LAST_7_DAYS',
    startDate: startOfDay(subDays(new Date(), 7)).toISOString(),
    endDate: new Date().toISOString()
  });
  
  const [data, setData] = useState<any[]>([]);
  const [kpis, setKpis] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = async (currentFilters: ReportFilters) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await generateReport(config.id, currentFilters);
      setData(res.data);
      setKpis(res.kpis);
    } catch (err: any) {
      setError(err.message || 'Failed to load report');
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(filters);
  }, []); // Initial load

  const handleExport = async () => {
    try {
      if (data.length === 0) {
        toast({ title: 'No Data', description: 'There is no data to export for this period.' });
        return;
      }

      // Format table headers dynamically based on data keys (excluding objects/nested)
      let tableHeaders: string[] = [];
      if (data.length > 0) {
         tableHeaders = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object');
      }

      const tableData = data.map(row => 
        tableHeaders.map(header => {
          const val = row[header];
          if (val === null || val === undefined) return '-';
          if (typeof val === 'boolean') return val ? 'Yes' : 'No';
          return String(val);
        })
      );

      const kpiArray = Object.entries(kpis).map(([key, val]) => ({
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), // camelCase to Title
        value: typeof val === 'number' ? val.toLocaleString() : String(val)
      }));

      const dateStr = `${format(new Date(filters.startDate), 'PP')} - ${format(new Date(filters.endDate), 'PP')}`;
      const fileName = `petrol-station-${config.id}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;

      exportToPDF({
        title: config.title,
        dateRangeText: dateStr,
        userName,
        kpis: kpiArray,
        tableHeaders,
        tableData,
        fileName
      });

      // Log export in DB
      await logReportExport(config.id, filters.startDate, filters.endDate, filters, fileName);

      toast({ title: 'Export Successful', description: 'PDF has been downloaded and logged.' });
    } catch (err: any) {
      toast({ title: 'Export Failed', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{config.title}</h2>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
        <Button onClick={handleExport} disabled={isLoading || data.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      <ReportFiltersBar 
        isLoading={isLoading}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          fetchReport(newFilters);
        }} 
      />

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* KPI Cards */}
      {!isLoading && !error && Object.keys(kpis).length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(kpis).map(([key, value]) => (
            <Card key={key}>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              {data.length > 0 && (
                <TableRow>
                  {Object.keys(data[0])
                    .filter(k => typeof data[0][k] !== 'object')
                    .map((header) => (
                    <TableHead key={header} className="whitespace-nowrap capitalize">
                      {header.replace(/_/g, ' ')}
                    </TableHead>
                  ))}
                </TableRow>
              )}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Loading report data...</p>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No data available for the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, i) => (
                  <TableRow key={i}>
                    {Object.keys(row)
                      .filter(k => typeof row[k] !== 'object')
                      .map((key) => {
                      const val = row[key];
                      return (
                        <TableCell key={key} className="whitespace-nowrap">
                          {val === null ? '-' : typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
