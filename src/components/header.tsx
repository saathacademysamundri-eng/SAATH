
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { ThemeSwitcher } from './theme-switcher';
import { usePathname } from 'next/navigation';
import { LiveDate, LiveTime } from './live-date-time';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { SearchCommand } from './search-command';
import { useState } from 'react';

export function Header() {
  const { settings } = useSettings();
  const [openSearch, setOpenSearch] = useState(false);

  return (
    <>
    <header className="sticky top-0 z-10 flex h-20 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 print:hidden">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
      </div>
      <div className='flex items-center gap-4'>
        <div className="relative hidden md:block">
            <button onClick={() => setOpenSearch(true)} className="flex items-center gap-2 rounded-lg border bg-muted/70 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted">
              <Search className="h-4 w-4" />
              <span>Search...</span>
              <kbd className="pointer-events-none ml-4 inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
        </div>
        <LiveDate />
        <LiveTime />
        <ThemeSwitcher />
        <UserNav />
      </div>
    </header>
    <SearchCommand open={openSearch} onOpenChange={setOpenSearch} />
    </>
  );
}
