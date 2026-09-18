'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Droplet,
  Fuel,
  Users,
  Settings,
  ClipboardList,
  Wrench,
  AlertTriangle,
  FileText,
  CreditCard,
  Truck,
  Box,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

const navItems = [
  { title: 'Dashboard', href: '/', icon: BarChart3 },
  { title: 'Fuel Management', href: '/fuel', icon: Droplet },
  { title: 'Storage Tanks', href: '/tanks', icon: Box },
  { title: 'Pumps & Nozzles', href: '/pumps', icon: Fuel },
  { title: 'Meter Readings', href: '/readings', icon: ClipboardList },
  { title: 'Transactions', href: '/transactions', icon: CreditCard },
  { title: 'Deliveries', href: '/deliveries', icon: Truck },
  { title: 'Shifts', href: '/shifts', icon: Users },
  { title: 'Maintenance', href: '/maintenance', icon: Wrench },
  { title: 'Incidents', href: '/incidents', icon: AlertTriangle },
  { title: 'Reports', href: '/reports', icon: FileText },
  { title: 'Settings', href: '/settings', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="flex h-16 items-center justify-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Droplet className="h-6 w-6 text-primary" />
          <span>PetrolManager</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                tooltip={item.title}
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <form action={logout}>
          <Button variant="outline" className="w-full justify-start gap-2" type="submit">
            <Settings className="h-4 w-4" />
            Logout
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  )
}
