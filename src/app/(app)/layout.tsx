

'use client';

import { Header } from '@/components/header';
import { Logo } from '@/components/logo';
import { useSettings } from '@/hooks/use-settings';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import {
  BookUser,
  DollarSign,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Megaphone,
  School,
  Settings,
  Users,
  Pin,
  PinOff,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function SidebarPin() {
    const { isPinned, setPinned } = useSidebar();
    return (
         <Button 
            variant="ghost" 
            size="icon" 
            className="hidden md:flex h-8 w-8 absolute top-2 right-2 transition-opacity group-data-[collapsible=icon]:opacity-0" 
            onClick={() => setPinned(!isPinned)}
        >
            {isPinned ? <PinOff /> : <Pin />}
        </Button>
    )
}

function MainSidebar() {
  const pathname = usePathname();
  const { settings } = useSettings();
  const { isPinned } = useSidebar();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/students', label: 'Students', icon: Users },
    { href: '/teachers', label: 'Teachers', icon: BookUser },
    { href: '/classes', label: 'Classes', icon: School },
    { href: '/fee-collection', label: 'Fee Collection', icon: DollarSign },
    { href: '/announcements', label: 'Announcements', icon: Megaphone },
  ];

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-center p-2 relative group-data-[collapsible=icon]:justify-center">
          <div className="flex flex-col items-center gap-2">
              <div className='h-12 w-12 bg-muted rounded-full flex items-center justify-center overflow-hidden shrink-0'>
                  <Logo noText={true} />
              </div>
              <div className="transition-opacity group-data-[collapsible=icon]:opacity-0">
                  <Badge variant="secondary" className="font-mono text-xs">{settings.academicSession}</Badge>
              </div>
          </div>
          <SidebarPin />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Button asChild variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center" isActive={pathname.startsWith(item.href)}
              >
                  <Link href={item.href}>
                    <item.icon className={cn(!isPinned ? "h-8 w-8" : "h-6 w-6")} />
                    <span className='group-data-[collapsible=icon]:hidden'>{item.label}</span>
                  </Link>
              </Button>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
           <SidebarMenuItem>
                <Button asChild variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center" isActive={pathname.startsWith('/settings')}>
                    <Link href="/settings">
                        <Settings className={cn(!isPinned ? "h-8 w-8" : "h-6 w-6")} />
                        <span className='group-data-[collapsible=icon]:hidden'>Settings</span>
                    </Link>
                </Button>
          </SidebarMenuItem>
          <SidebarMenuItem>
              <Button asChild variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center">
                <Link href="#">
                    <LifeBuoy className={cn(!isPinned ? "h-8 w-8" : "h-6 w-6")} />
                    <span className='group-data-[collapsible=icon]:hidden'>Support</span>
                </Link>
             </Button>
          </SidebarMenuItem>
          <SidebarMenuItem>
             <Button asChild variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center">
                <Link href="/">
                    <LogOut className={cn(!isPinned ? "h-8 w-8" : "h-6 w-6")} />
                    <span className='group-data-[collapsible=icon]:hidden'>Log Out</span>
                </Link>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
