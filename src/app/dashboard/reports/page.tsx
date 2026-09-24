/* eslint-disable */
import { getCurrentUserRole } from '@/lib/auth-helpers';
import { REPORT_CONFIGS } from '@/lib/reports/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function ReportsIndexPage() {
  const role = await getCurrentUserRole();

  // Filter reports based on user role
  const availableReports = Object.values(REPORT_CONFIGS).filter(config => 
    role && config.allowedRoles.includes(role)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Generate, view, and export operational and financial reports.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {availableReports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="flex flex-col hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl">{report.title}</CardTitle>
                <CardDescription className="min-h-[40px]">
                  {report.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <Button className="w-full group" asChild>
                  <Link href={`/dashboard/reports/${report.id}`}>
                    Open Report
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {availableReports.length === 0 && (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">You do not have permission to view any reports.</p>
        </div>
      )}
    </div>
  );
}
