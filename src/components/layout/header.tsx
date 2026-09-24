'use client';
/* eslint-disable */

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, AlertTriangle, Package, Wrench, CheckCircle2 } from 'lucide-react';
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SIDEBAR_NAV_ITEMS } from '@/config/permissions';
import { ProfileWithRole } from '@/types/auth';
import { DashboardNotification } from '@/types/notifications';
import { LogoutButton } from '@/components/auth/logout-button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { APP_VERSION } from '@/lib/version';

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
  notifications: DashboardNotification[];
}

export function Header({ profile, notifications }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const paths = pathname.split('/').filter(Boolean);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const searchableItems = React.useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return SIDEBAR_NAV_ITEMS.filter((item) => {
      const isAllowed = !profile?.role_name || item.allowedRoles.includes(profile.role_name);
      const searchableText = `${item.title} ${item.href}`.toLowerCase();
      return isAllowed && searchableText.includes(normalizedQuery);
    });
  }, [profile, searchQuery]);

  const navigateToSearchResult = (href: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    router.push(href);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
    }

    if (event.key === 'Enter' && searchableItems.length === 1) {
      event.preventDefault();
      navigateToSearchResult(searchableItems[0].href);
    }
  };

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
        <div className="relative hidden w-64 md:block">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            placeholder="Search pages..."
            aria-label="Search dashboard pages"
            role="combobox"
            aria-expanded={searchOpen && searchQuery.trim().length > 0}
            aria-controls="dashboard-search-results"
            className="w-full pl-9 bg-muted/50 border-border/50 focus:border-primary/50 transition-colors"
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={handleSearchKeyDown}
          />

          {searchOpen && searchQuery.trim().length > 0 && (
            <div
              id="dashboard-search-results"
              role="listbox"
              className="absolute left-0 right-0 top-10 z-50 overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setSearchOpen(false);
                }
              }}
            >
              {searchableItems.length > 0 ? (
                searchableItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      type="button"
                      role="option"
                      aria-selected={false}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => navigateToSearchResult(item.href)}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate">{item.title}</span>
                      <span className="truncate text-xs text-muted-foreground">{item.href}</span>
                    </button>
                  );
                })
              ) : (
                <p className="px-3 py-3 text-sm text-muted-foreground">
                  No matching pages found.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Version indicator */}
        <div className="flex items-center text-xs font-semibold px-2 py-1 bg-secondary text-secondary-foreground rounded-md border shadow-sm">
          v{APP_VERSION}
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notification bell */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Notifications (${notifications.length} active)`}
                className="relative text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              />
            }
          >
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96 p-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="font-semibold">Notifications</p>
                <p className="text-xs text-muted-foreground">
                  {notifications.length === 0 ? 'You are all caught up' : `${notifications.length} active alert${notifications.length === 1 ? '' : 's'}`}
                </p>
              </div>
              {notifications.length > 0 && <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{notifications.length}</span>}
            </div>
            {notifications.length > 0 ? (
              <div className="max-h-80 overflow-y-auto p-2">
                {notifications.map((notification) => {
                  const Icon = notification.kind === 'inventory'
                    ? Package
                    : notification.kind === 'incident'
                      ? AlertTriangle
                      : Wrench;
                  return (
                    <DropdownMenuItem
                      key={notification.id}
                      onClick={() => router.push(notification.href)}
                      className="items-start gap-3 px-3 py-3"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 space-y-1">
                        <span className="block text-sm font-medium">{notification.title}</span>
                        <span className="block text-xs text-muted-foreground">{notification.description}</span>
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <p className="text-sm font-medium">No active notifications</p>
                <p className="text-xs text-muted-foreground">New alerts will appear here.</p>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

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
