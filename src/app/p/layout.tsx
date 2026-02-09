'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Globe, LogIn } from 'lucide-react';
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
              <span className="font-bold text-[#1e40af] text-lg block leading-none">{settings.name || 'SAATH Academy'}</span>
              <span className="text-xs text-[#059669] font-semibold uppercase tracking-wider">Public Portal</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" asChild className="text-slate-600 hover:text-[#1e40af] font-semibold">
              <Link href="https://www.saathsamundri.com/">
                <Globe className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Website</span>
                <span className="sm:hidden">Website</span>
              </Link>
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <Button size="sm" variant="outline" asChild className="border-[#1e40af] text-[#1e40af] hover:bg-[#1e40af] hover:text-white font-bold rounded-full px-6">
              <Link href="/login">
                <LogIn className="h-4 w-4 mr-2" />
                Staff Login
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 px-4 text-center text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-6">
             <div className="h-12 w-12 grayscale opacity-50 contrast-200">
                <Logo noText={true} />
             </div>
          </div>
          <p className="font-semibold text-slate-300 mb-2">© {new Date().getFullYear()} {settings.name}. All Rights Reserved.</p>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Powered by SchoolUP Platform</p>
        </div>
      </footer>
    </div>
  );
}
