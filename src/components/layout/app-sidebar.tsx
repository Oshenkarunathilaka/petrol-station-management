'use client';
/* eslint-disable */

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fuel } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { SIDEBAR_NAV_ITEMS } from '@/config/permissions';
import { UserRole } from '@/types/auth';

import { APP_VERSION } from '@/lib/version';

export function AppSidebar({ userRole }: { userRole: UserRole | null }) {
  const pathname = usePathname();

  const visibleItems = SIDEBAR_NAV_ITEMS.filter((item) => {
    if (!userRole) return false;
    return item.allowedRoles.includes(userRole);
  });

  const operations = visibleItems.filter((i) => i.section === 'OPERATIONS');
  const management = visibleItems.filter((i) => i.section === 'MANAGEMENT');
  const analytics = visibleItems.filter((i) => i.section === 'ANALYTICS');
  const system = visibleItems.filter((i) => i.section === 'SYSTEM');

  const renderNavGroup = (title: string, items: typeof visibleItems) => {
    if (items.length === 0) return null;
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="text-[10px] font-bold tracking-widest uppercase text-sidebar-foreground/40 px-3 mb-1">
          {title}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={item.title}
                    render={<Link href={item.href} />}
                    className={
                      isActive
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-sidebar-foreground/80 hover:bg-white/10 hover:text-white'
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar variant="inset">
      {/* Branded header */}
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border px-4 py-2">
        <Link href="/dashboard" className="flex items-center gap-3 font-semibold w-full">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 shadow-inner ring-1 ring-white/20">
            <Fuel className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-white font-bold text-sm tracking-wide">PetrolStation</span>
            <span className="text-sidebar-foreground/50 text-[10px] font-medium tracking-widest uppercase">Management</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 pt-2">
        {renderNavGroup('Operations', operations)}
        {operations.length > 0 && <SidebarSeparator className="my-2 bg-sidebar-border" />}

        {renderNavGroup('Management', management)}
        {management.length > 0 && <SidebarSeparator className="my-2 bg-sidebar-border" />}

        {renderNavGroup('Analytics', analytics)}
        {analytics.length > 0 && <SidebarSeparator className="my-2 bg-sidebar-border" />}

        {renderNavGroup('System', system)}
      </SidebarContent>

      <div className="p-4 border-t border-sidebar-border text-center">
        <span className="text-xs text-sidebar-foreground/50 font-medium">Version {APP_VERSION}</span>
      </div>
    </Sidebar>
  );
}
