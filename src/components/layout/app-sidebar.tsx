'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Droplet } from 'lucide-react';
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

export function AppSidebar({ userRole }: { userRole: UserRole | null }) {
  const pathname = usePathname();

  // Filter items based on user role
  const visibleItems = SIDEBAR_NAV_ITEMS.filter((item) => {
    if (!userRole) return false;
    return item.allowedRoles.includes(userRole);
  });

  // Group by section
  const operations = visibleItems.filter((i) => i.section === 'OPERATIONS');
  const management = visibleItems.filter((i) => i.section === 'MANAGEMENT');
  const analytics = visibleItems.filter((i) => i.section === 'ANALYTICS');
  const system = visibleItems.filter((i) => i.section === 'SYSTEM');

  const renderNavGroup = (title: string, items: typeof visibleItems) => {
    if (items.length === 0) return null;
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{title}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => {
              // Exact match or active sub-route logic
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={isActive} 
                    tooltip={item.title}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
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
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border px-4 py-2">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold w-full">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Droplet className="h-5 w-5" />
          </div>
          <span className="truncate">PetrolStation</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        {renderNavGroup('Operations', operations)}
        {operations.length > 0 && <SidebarSeparator />}
        
        {renderNavGroup('Management', management)}
        {management.length > 0 && <SidebarSeparator />}
        
        {renderNavGroup('Analytics', analytics)}
        {analytics.length > 0 && <SidebarSeparator />}
        
        {renderNavGroup('System', system)}
      </SidebarContent>
    </Sidebar>
  );
}
