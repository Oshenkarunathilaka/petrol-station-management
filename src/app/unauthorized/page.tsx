/* eslint-disable */
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/auth/logout-button';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <div className="flex max-w-[420px] flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Unauthorized Access</h1>
        <p className="mb-8 text-muted-foreground">
          You do not have the required permissions to access this page. If you believe this is an error, please contact your system administrator.
        </p>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              Return to Dashboard
            </Button>
          </Link>
          <div className="w-full sm:w-auto [&>button]:w-full">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
