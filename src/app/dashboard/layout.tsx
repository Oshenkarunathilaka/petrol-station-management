import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';
import { getCurrentUser, getCurrentProfile } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await getCurrentProfile();

  return (
    <SidebarProvider>

      <AppSidebar userRole={profile?.role_name || null} />
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <SidebarInset>
          <Header profile={profile} />
          <main className="flex flex-1 flex-col min-w-0 p-6 bg-background">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
