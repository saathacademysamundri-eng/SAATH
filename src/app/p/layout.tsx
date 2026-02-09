'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';

export default function PublicPortalLayout({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Shared Public Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10">
              <Logo noText={true} />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-[#1e40af] text-lg block leading-none">SAATH Academy</span>
              <span className="text-xs text-[#059669] font-semibold uppercase tracking-wider">Public Portal</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" asChild className="text-slate-600 hover:text-[#1e40af]">
              <Link href="#" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Website</span>
                <span className="sm:hidden">Website</span>
              </Link>
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <Button size="sm" variant="outline" asChild className="border-[#1e40af] text-[#1e40af] hover:bg-[#1e40af] hover:text-white">
              <Link href="/login">Staff Login</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 px-4 text-center text-sm">
        <div className="max-w-7xl mx-auto">
          <p>© {new Date().getFullYear()} {settings.name}. All Rights Reserved.</p>
          <p className="mt-2 text-slate-500 font-mono text-xs uppercase tracking-widest">Powered by SchoolUP</p>
        </div>
      </footer>
    </div>
  );
}
