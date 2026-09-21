'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
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

interface HeaderProps {
  profile: ProfileWithRole | null;
}

export function Header({ profile }: HeaderProps) {
  const pathname = usePathname();
  
  // Create a basic breadcrumb from pathname
  const paths = pathname.split('/').filter(Boolean);
  
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-4 border-b bg-background px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-3" />
        
        <div className="hidden md:flex items-center">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
              </BreadcrumbItem>
              {paths.length > 1 && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="capitalize">
                      {paths[paths.length - 1].replace(/-/g, ' ')}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full bg-background pl-9 md:w-[300px]"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-10 w-10 rounded-full border-none bg-transparent outline-none cursor-pointer p-0">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src="" alt={profile?.full_name || 'User'} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.email}
                </p>
                {profile?.role_name && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {profile.role_name}
                    </Badge>
                  </div>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
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
