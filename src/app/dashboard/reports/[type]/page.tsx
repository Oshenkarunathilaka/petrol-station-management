import { getCurrentProfile } from '@/lib/auth-helpers';
import { REPORT_CONFIGS, ReportType } from '@/lib/reports/config';
import { ReportViewer } from '@/components/reports/report-viewer';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function ReportPage({ params }: { params: Promise<{ type: string }> }) {
  const resolvedParams = await params;
  const profile = await getCurrentProfile();
  const reportType = resolvedParams.type as ReportType;
  
  const config = REPORT_CONFIGS[reportType];
  
  if (!config) {
    notFound();
  }
  
  if (!profile || !config.allowedRoles.includes(profile.role_name)) {
    redirect('/dashboard/reports');
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Button variant="outline" size="sm" asChild>
        <Link href="/dashboard/reports">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Link>
      </Button>

      <ReportViewer 
        config={{ id: config.id, title: config.title, description: config.description }} 
        userName={profile?.full_name || 'System User'} 
      />
    </div>
  );
}
