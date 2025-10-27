
'use client';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { auth } from '@/lib/firebase/config';
import { Menu, Search } from 'lucide-react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';

const menuItems = [
  { label: 'Home', href: '#' },
  { label: 'About', href: '#' },
  { label: 'Gallery', href: '#' },
  { label: 'Results', href: '#' },
  { label: 'Teachers', href: '#' },
  { label: 'Notice Board', href: '#' },
  { label: 'Contact Us', href: '#' },
];

export function Header() {
  const [user, loading] = useAuthState(auth);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="mr-4 flex">
          <Link href="/" className="h-12 w-auto">
            <Logo />
          </Link>
        </div>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="mb-4 flex h-12 w-auto">
                <Logo />
              </div>
              <nav className="flex flex-col gap-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" size="icon">
                <Search />
            </Button>
          {!loading && user ? (
            <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
             <Button asChild variant="outline">
                <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
