'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PublicPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Academy Header perfectly matched to saathsamundri.com branding */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="https://www.saathsamundri.com/" className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl overflow-hidden bg-white shadow-sm border border-slate-100 flex items-center justify-center p-1">
              <Logo noText={true} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[#1e40af] text-lg sm:text-2xl leading-none tracking-tight uppercase">SAATH ACADEMY</span>
              <span className="font-bold text-[#059669] text-[10px] sm:text-sm mt-0.5 tracking-[0.2em] uppercase">SAMUNDRI</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" asChild className="text-slate-600 hover:text-[#1e40af] font-semibold flex text-xs sm:text-sm px-2 sm:px-4">
              <Link href="https://www.saathsamundri.com/">
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Back to </span>Website
              </Link>
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <Button size="sm" variant="outline" asChild className="border-[#1e40af] text-[#1e40af] hover:bg-[#1e40af] hover:text-white font-bold rounded-full px-4 sm:px-6 text-xs sm:text-sm">
              <Link href="/login">
                Login
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-[#0f172a] text-slate-400 py-12 px-4 text-center border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-center mb-2">
             <div className="h-12 w-12 grayscale opacity-50 contrast-200">
                <Logo noText={true} />
             </div>
          </div>
          
          <div className="space-y-4">
            <p className="font-black text-slate-200 text-sm sm:text-base tracking-tight uppercase">
              © 2026 SAATH ACADEMY SAMUNDRI. All Rights Reserved.
            </p>
            
            <div className="space-y-2">
              <p className="text-slate-500 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.4em] font-bold">
                POWERED BY SCHOOLUP PLATFORM
              </p>
              <p className="text-slate-600 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.25em]">
                DEVELOPED BY MIAN MUDASSAR
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
