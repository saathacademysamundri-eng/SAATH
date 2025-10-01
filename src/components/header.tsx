
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { ThemeSwitcher } from './theme-switcher';
import { usePathname } from 'next/navigation';
import { LiveDate, LiveTime } from './live-date-time';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

function getPageTitle(pathname: string) {
    if (pathname === '/dashboard') return { title: 'Dashboard', description: 'Overview of your academy\'s stats.' };
    if (pathname.startsWith('/students')) return { title: 'Students', description: 'Manage student profiles, fees, and results.' };
    if (pathname.startsWith('/teachers')) return { title: 'Teachers', description: 'View teacher profiles and their earnings.' };
    if (pathname.startsWith('/classes')) return { title: 'Classes', description: 'Manage classes and their subjects.' };
    if (pathname.startsWith('/attendance')) return { title: 'Attendance', description: 'Mark student attendance for today.' };
    if (pathname.startsWith('/exams')) return { title: 'Exams', description: 'Create and manage academic exams.' };
    if (pathname.startsWith('/fee-collection')) return { title: 'Fee Collection', description: 'Search for a student to collect fees.' };
    if (pathname.startsWith('/income')) return { title: 'Income', description: 'A record of all fee collections.' };
    if (pathname.startsWith('/expenses')) return { title: 'Expenses', description: 'A record of all operational expenses.' };
    if (pathname.startsWith('/reports')) return { title: 'Reports', description: 'Generate, view, and export reports.' };
    if (pathname.startsWith('/announcements')) return { title: 'Announcements', description: 'Use AI to summarize announcements.' };
    if (pathname.startsWith('/settings')) return { title: 'Settings', description: 'Manage your academy\'s settings.' };
    return { title: 'Dashboard', description: 'Overview of your academy\'s stats.' };
}


export function Header() {
  const pathname = usePathname();
  const { title, description } = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 print:hidden">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <div>
            <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
            <p className="text-xs text-muted-foreground hidden md:block">{description}</p>
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-8 w-48 bg-muted border-none focus-visible:ring-primary" 
            />
        </div>
        <LiveDate />
        <LiveTime />
        <ThemeSwitcher />
        <UserNav />
      </div>
    </header>
  );
}
