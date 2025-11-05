
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
  TrendingUp,
  TrendingDown,
  FileText,
  ClipboardCheck,
  LineChart,
  ClipboardPenLine,
  BookCopy,
  CreditCard,
  User as UserIcon,
  MessageCircleQuestion,
  Palette,
  Globe,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { AppProvider } from '@/hooks/use-app-context';
import { WelcomeDialog } from '@/components/welcome-dialog';
import { GlobalPreloader } from '@/components/global-preloader';
import { useLock } from '@/hooks/use-lock';
import { LockScreen } from '@/components/lock-screen';
import { WelcomeBackDialog } from '@/components/welcome-back-dialog';

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
  const router = useRouter();
  const { settings } = useSettings();
  const { isPinned } = useSidebar();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/students', label: 'Students', icon: Users },
    { href: '/teachers', label: 'Teachers', icon: BookUser },
    { href: '/classes', label: 'Classes', icon: School },
    { href: '/attendance', label: 'Attendance', icon: ClipboardCheck },
    { href: '/teacher-attendance', label: 'Teacher Attendance', icon: UserCheck },
    { href: '/exams', label: 'Exams', icon: ClipboardPenLine },
    { href: '/fee-collection', label: 'Fee Collection', icon: DollarSign },
    { href: '/income', label: 'Income', icon: TrendingUp },
    { href: '/expenses', label: 'Expenses', icon: TrendingDown },
    { href: '/academy-share', label: 'Academy Share', icon: TrendingUp },
    { href: '/reports', label: 'Reports', icon: LineChart },
    { href: '/announcements', label: 'Announcements', icon: Megaphone },
  ];

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon" className="print:hidden">
      <SidebarHeader>
        <div className="flex items-center justify-center p-2 relative group-data-[collapsible=icon]:justify-center">
          <div className="flex flex-col items-center gap-2">
              <div className='h-12 w-12 bg-sidebar-primary text-sidebar-primary-foreground rounded-full flex items-center justify-center overflow-hidden shrink-0'>
                  <Logo noText={true} />
              </div>
              <div className="transition-opacity group-data-[collapsible=icon]:opacity-0">
                  <Badge variant="outline" className="font-mono text-xs border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground">{settings.academicSession}</Badge>
              </div>
          </div>
          <SidebarPin />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Button asChild variant="ghost" className="w-full justify-start gap-2 h-10 group-data-[collapsible=icon]:justify-center" isActive={pathname.startsWith(item.href)}
              >
                  <Link href={item.href}>
                    <item.icon className={cn("h-6 w-6")} />
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
                <Button asChild variant="ghost" className="w-full justify-start gap-2 h-10 group-data-[collapsible=icon]:justify-center" isActive={pathname.startsWith('/settings')}>
                    <Link href="/settings">
                        <Settings className={cn("h-6 w-6")} />
                        <span className='group-data-[collapsible=icon]:hidden'>Settings</span>
                    </Link>
                </Button>
          </SidebarMenuItem>
          <SidebarMenuItem>
              <Button asChild variant="ghost" className="w-full justify-start gap-2 h-10 group-data-[collapsible=icon]:justify-center">
                <Link href="#">
                    <MessageCircleQuestion className={cn("h-6 w-6")} />
                    <span className='group-data-[collapsible=icon]:hidden'>Support</span>
                </Link>
             </Button>
          </SidebarMenuItem>
          <SidebarMenuItem>
             <Button variant="ghost" className="w-full justify-start gap-2 h-10 group-data-[collapsible=icon]:justify-center" onClick={handleLogout}>
                <LogOut className={cn("h-6 w-6")} />
                <span className='group-data-[collapsible=icon]:hidden'>Log Out</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}


export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const { isLocked } = useLock();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  if (loading) {
      return <GlobalPreloader />;
  }
  
  if (isLocked) {
    return <LockScreen />;
  }


  if (!user) {
      return null;
  }

  return (
    <>
        <WelcomeDialog />
        <WelcomeBackDialog />
        <SidebarProvider>
            <MainSidebar />
            <SidebarInset>
                <Header />
                <main className="flex-1 p-4 sm:p-6">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    </>
  );
}
