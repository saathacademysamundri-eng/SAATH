'use client';

import {
    LayoutDashboard,
    LogOut,
    MessageCircleQuestion,
    Users,
    ClipboardPenLine,
    BookCopy
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
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
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/hooks/use-settings';
import { SupportDialog } from '@/components/support-dialog';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { WhatsappSupportButton } from '@/components/whatsapp-support-button';
import { useTeacherAuth } from '@/hooks/use-teacher-auth';
import { GlobalPreloader } from '@/components/global-preloader';
import { AppProvider, useAppContext } from '@/hooks/use-app-context';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

function TeacherSidebar() {
  const pathname = usePathname();
  const { settings } = useSettings();
  const { teacher, logout } = useTeacherAuth();
  const { students } = useAppContext();

  const menuItems = [
    { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/teacher/exams', label: 'Exams', icon: ClipboardPenLine },
  ];

  const teacherStudents = useMemo(() => {
    if (!teacher) return [];
    return students.filter(student => 
      student.subjects.some(sub => sub.teacher_id === teacher.id)
    );
  }, [teacher, students]);

  if (!teacher) return null;

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
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Button asChild variant="ghost" className="w-full justify-start gap-2 h-10 group-data-[collapsible=icon]:justify-center" isActive={pathname === item.href}
              >
                  <Link href={item.href}>
                    <item.icon className={cn("h-6 w-6")} />
                    <span className='group-data-[collapsible=icon]:hidden'>{item.label}</span>
                  </Link>
              </Button>
            </SidebarMenuItem>
          ))}
          <Accordion type="single" collapsible>
              <AccordionItem value="students" className="border-none">
                  <AccordionTrigger className="w-full justify-start gap-2 h-10 group-data-[collapsible=icon]:justify-center hover:no-underline hover:bg-accent hover:text-accent-foreground rounded-md px-2">
                       <div className="flex items-center gap-2">
                         <Users className={cn("h-6 w-6")} />
                         <span className='group-data-[collapsible=icon]:hidden'>My Students</span>
                       </div>
                  </AccordionTrigger>
                  <AccordionContent>
                      <SidebarMenu className="pl-4">
                        {teacherStudents.map(student => (
                           <SidebarMenuItem key={student.id}>
                             <Button asChild variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 group-data-[collapsible=icon]:justify-center" isActive={pathname.endsWith(student.id)}>
                               <Link href={`/students/${student.id}`}>
                                  <span className='group-data-[collapsible=icon]:hidden'>{student.name}</span>
                               </Link>
                             </Button>
                           </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                  </AccordionContent>
              </AccordionItem>
          </Accordion>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Dialog>
            <SidebarMenu>
            <DialogTrigger asChild>
                <SidebarMenuItem>
                    <Button variant="ghost" className="w-full justify-start gap-2 h-10 group-data-[collapsible=icon]:justify-center">
                        <MessageCircleQuestion className={cn("h-6 w-6")} />
                        <span className='group-data-[collapsible=icon]:hidden'>Support</span>
                    </Button>
                </SidebarMenuItem>
            </DialogTrigger>
            <SidebarMenuItem>
                <Button variant="ghost" className="w-full justify-start gap-2 h-10 group-data-[collapsible=icon]:justify-center" onClick={logout}>
                    <LogOut className={cn("h-6 w-6")} />
                    <span className='group-data-[collapsible=icon]:hidden'>Log Out</span>
                </Button>
            </SidebarMenuItem>
            </SidebarMenu>
            <SupportDialog />
        </Dialog>
      </SidebarFooter>
    </Sidebar>
  );
}

function TeacherHeader() {
    return (
         <header className="sticky top-0 z-10 flex h-20 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 print:hidden">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
            </div>
         </header>
    )
}

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { teacher, loading } = useTeacherAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/teacher/login') {
    return <>{children}</>;
  }

  useEffect(() => {
    if (!loading && !teacher) {
      router.replace('/teacher/login');
    }
  }, [teacher, loading, router, pathname]);
  
  if (loading || !teacher) {
    return <GlobalPreloader />;
  }
  
  return (
    <SidebarProvider>
      <TeacherSidebar />
      <SidebarInset>
        <TeacherHeader />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
        <WhatsappSupportButton />
      </SidebarInset>
    </SidebarProvider>
  );
}
