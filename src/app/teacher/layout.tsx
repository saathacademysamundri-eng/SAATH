'use client';

import {
    LayoutDashboard,
    LogOut,
    MessageCircleQuestion,
    Users,
    ClipboardPenLine,
    BookCopy,
    ClipboardCheck,
    ArrowLeft,
    User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, Suspense, useState } from 'react';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { WhatsappSupportButton } from '@/components/whatsapp-support-button';
import { useTeacherAuth } from '@/hooks/use-teacher-auth';
import { GlobalPreloader } from '@/components/global-preloader';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { TeacherWelcomeDialog } from './welcome-dialog';
import { LiveDate, LiveTime } from '@/components/live-date-time';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppProvider } from '@/hooks/use-app-context';
import { NotificationsMenu } from '@/components/notifications-menu';
import { ExamDeadlineReminderDialog } from './deadline-reminder-dialog';
import { getExamsByTeacher, getStudents } from '@/lib/firebase/firestore';
import { Exam, Student } from '@/lib/data';


function TeacherSidebar() {
  const pathname = usePathname();
  const { settings } = useSettings();
  const { teacher, logout } = useTeacherAuth();
  
  const menuItems = [
    { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/teacher/students', label: 'My Students', icon: Users },
    { href: '/teacher/exams', label: 'Exams', icon: ClipboardPenLine },
    { href: '/teacher/attendance', label: 'Attendance', icon: ClipboardCheck },
  ];

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

function TeacherUserNav() {
  const { teacher, logout } = useTeacherAuth();
  const router = useRouter();

  if (!teacher) return null;

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={teacher.imageUrl} alt={teacher.name} />
              <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{teacher.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {teacher.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href="/teacher/profile">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <MessageCircleQuestion className="mr-2 h-4 w-4" />
              <span>Support</span>
            </DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SupportDialog />
    </Dialog>
  );
}

function TeacherHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const { settings } = useSettings();
    const { teacher } = useTeacherAuth();

    useEffect(() => {
        const academyName = settings.name || 'My Academy';
        const pageName = pathname.split('/').filter(Boolean).pop() || 'dashboard';
        let title = pageName.charAt(0).toUpperCase() + pageName.slice(1);
        
        if (pathname.includes('/teacher/exams/')) title = 'Exam Results';

        document.title = `${title} | ${academyName}`;
    }, [pathname, settings.name]);

    return (
         <header className="sticky top-0 z-10 flex h-20 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 print:hidden">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                {pathname !== '/teacher/dashboard' && (
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => router.back()}>
                    <ArrowLeft />
                    <span className="sr-only">Go Back</span>
                  </Button>
                )}
                 <div className="h-10 w-auto md:hidden">
                    <Logo noText={true} />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <LiveDate />
                <LiveTime />
                <ThemeSwitcher />
                <NotificationsMenu userId={teacher?.id || null} />
                <TeacherUserNav />
            </div>
         </header>
    )
}

const SNOOZE_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours
const SNOOZE_STORAGE_KEY = 'examDeadlineSnooze';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { teacher, loading } = useTeacherAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [overdueExams, setOverdueExams] = useState<Exam[]>([]);
  const [isReminderOpen, setIsReminderOpen] = useState(false);

  const handleSnooze = () => {
    const now = new Date().getTime();
    const snoozedData = {
        examIds: overdueExams.map(e => e.id),
        expiresAt: now + SNOOZE_DURATION_MS,
    };
    sessionStorage.setItem(SNOOZE_STORAGE_KEY, JSON.stringify(snoozedData));
    setIsReminderOpen(false);
  };

  useEffect(() => {
    if (teacher && !loading) {
        const checkDeadlines = async () => {
            const [exams, allStudents] = await Promise.all([
                getExamsByTeacher(teacher.id),
                getStudents()
            ]);

            const now = new Date();

            const upcomingOrOverdueIncomplete = exams.filter(exam => {
                if (!exam.submissionDeadline || exam.status !== 'approved') {
                    return false;
                }

                const deadline = new Date(exam.submissionDeadline);
                const isPastDue = deadline < now;
                
                if (!isPastDue) return false;

                const studentsForExam = allStudents.filter(student => 
                    student.class === exam.className && 
                    (exam.scope === 'class' || student.subjects.some(sub => sub.teacher_id === teacher.id))
                );
                
                if (studentsForExam.length === 0) return false;

                const resultsMap = new Map(exam.results?.map(r => [r.studentId, r.marks]) || []);

                const isExamIncomplete = studentsForExam.some(student => {
                    const studentResult = resultsMap.get(student.id);
                    if (!studentResult) return true; 
                    return exam.subjects.some(subjectName => studentResult[subjectName] == null);
                });
                
                return isExamIncomplete;
            });
            
            const snoozedDataString = sessionStorage.getItem(SNOOZE_STORAGE_KEY);
            let snoozedExamIds: string[] = [];

            if (snoozedDataString) {
                try {
                    const snoozedData = JSON.parse(snoozedDataString);
                    if (new Date().getTime() < snoozedData.expiresAt) {
                        snoozedExamIds = snoozedData.examIds || [];
                    } else {
                        sessionStorage.removeItem(SNOOZE_STORAGE_KEY);
                    }
                } catch (e) {
                    sessionStorage.removeItem(SNOOZE_STORAGE_KEY);
                }
            }
            
            const finalExamsToShow = upcomingOrOverdueIncomplete.filter(
                exam => !snoozedExamIds.includes(exam.id)
            );

            if (finalExamsToShow.length > 0) {
                setOverdueExams(finalExamsToShow);
                setIsReminderOpen(true);
            } else {
                setOverdueExams([]);
                setIsReminderOpen(false);
            }
        };

        checkDeadlines();
    }
  }, [teacher, loading, pathname]);
  
  if (pathname === '/teacher/login') {
    return <>{children}</>;
  }

  if (loading || !teacher) {
    return <GlobalPreloader />;
  }
  
  return (
    <Suspense fallback={<GlobalPreloader />}>
      <AppProvider>
        <SidebarProvider>
          <TeacherWelcomeDialog />
          <ExamDeadlineReminderDialog
            isOpen={isReminderOpen}
            onOpenChange={setIsReminderOpen}
            exams={overdueExams}
            onSnooze={handleSnooze}
          />
          <TeacherSidebar />
          <SidebarInset>
            <TeacherHeader />
            <main className="flex-1 p-4 sm:p-6">{children}</main>
            <WhatsappSupportButton />
          </SidebarInset>
        </SidebarProvider>
      </AppProvider>
    </Suspense>
  );
}
