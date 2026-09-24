'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ProfileWithRole } from '@/types/auth';
import { LogoutButton } from '@/components/auth/logout-button';
import { ThemeToggle } from '@/components/layout/theme-toggle';

// Role badge colors
const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-primary text-primary-foreground',
  MANAGER: 'bg-amber-600 text-white',
  SUPERVISOR: 'bg-blue-600 text-white',
  CASHIER: 'bg-emerald-600 text-white',
  ATTENDANT: 'bg-slate-500 text-white',
};

interface HeaderProps {
  profile: ProfileWithRole | null;
}

export function Header({ profile }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const paths = pathname.split('/').filter(Boolean);
  const roleBadgeClass = ROLE_COLORS[profile?.role_name || ''] || 'bg-muted text-muted-foreground';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-4 border-b bg-background/95 backdrop-blur-sm px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-3 text-muted-foreground hover:text-primary transition-colors" />

        <div className="hidden md:flex items-center">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              {paths.length > 1 && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="capitalize font-semibold text-foreground">
                      {paths[paths.length - 1].replace(/-/g, ' ')}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full pl-9 bg-muted/50 border-border/50 focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notification bell */}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border-none bg-transparent outline-none cursor-pointer p-0">
            <Avatar className="h-9 w-9 ring-2 ring-primary/30 hover:ring-primary/60 transition-all">
              <AvatarImage src="" alt={profile?.full_name || 'User'} />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1.5">
                  <p className="text-sm font-semibold leading-none">{profile?.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
                  {profile?.role_name && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${roleBadgeClass}`}>
                        {profile.role_name}
                      </span>
                    </div>
                  )}
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/dashboard/profile')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="p-1">
              <LogoutButton />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
