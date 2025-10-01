
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { ThemeSwitcher } from './theme-switcher';
import { usePathname } from 'next/navigation';
import { LiveDateTime } from './live-date-time';

function getPageTitle(pathname: string) {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.startsWith('/students')) return 'Students';
    if (pathname.startsWith('/teachers')) return 'Teachers';
    if (pathname.startsWith('/classes')) return 'Classes';
    if (pathname.startsWith('/attendance')) return 'Attendance';
    if (pathname.startsWith('/exams')) return 'Exams';
    if (pathname.startsWith('/fee-collection')) return 'Fee Collection';
    if (pathname.startsWith('/income')) return 'Income';
    if (pathname.startsWith('/expenses')) return 'Expenses';
    if (pathname.startsWith('/reports')) return 'Reports';
    if (pathname.startsWith('/earnings-reports')) return 'Earnings Reports';
    if (pathname.startsWith('/announcements')) return 'Announcements';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'Dashboard';
}


export function Header() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 print:hidden">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <div>
            <h1 className="text-lg font-semibold md:text-xl">{pageTitle}</h1>
            <LiveDateTime />
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <ThemeSwitcher />
        <UserNav />
      </div>
    </header>
  );
}
