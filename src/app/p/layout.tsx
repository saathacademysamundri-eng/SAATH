
'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';

export default function PublicPortalLayout({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Academy Header aligned with provided branding image */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="https://www.saathsamundri.com/" className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl overflow-hidden bg-white shadow-sm border border-slate-100 flex items-center justify-center p-1">
              <Logo noText={true} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[#1e40af] text-xl sm:text-2xl leading-none tracking-tight">SAATH ACADEMY</span>
              <span className="font-bold text-[#059669] text-xs sm:text-sm mt-0.5 tracking-[0.2em]">SAMUNDRI</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" asChild className="text-slate-600 hover:text-[#1e40af] font-semibold flex">
              <Link href="https://www.saathsamundri.com/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Website
              </Link>
            </Button>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <Button size="sm" variant="outline" asChild className="border-[#1e40af] text-[#1e40af] hover:bg-[#1e40af] hover:text-white font-bold rounded-full px-6 hidden sm:flex">
              <Link href="/login">
                Staff Login
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-[#0f172a] text-slate-400 py-12 px-4 text-center text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-6">
             <div className="h-12 w-12 grayscale opacity-50 contrast-200">
                <Logo noText={true} />
             </div>
          </div>
          <p className="font-semibold text-slate-300 mb-2">© {new Date().getFullYear()} SAATH Academy. All Rights Reserved.</p>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Powered by SchoolUP Platform</p>
        </div>
      </footer>
    </div>
  );
}
