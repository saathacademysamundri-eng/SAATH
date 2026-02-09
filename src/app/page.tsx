'use client';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Award, Wallet, GraduationCap, ArrowRight, Globe } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export default function EntryGatewayPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="max-w-md w-full text-center space-y-12">
        <div className="space-y-6">
          <div className="h-24 w-24 mx-auto bg-white rounded-3xl shadow-2xl p-4 animate-in zoom-in-50 duration-700">
            <Logo noText={true} />
          </div>
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">SAATH Academy</h1>
            <p className="text-[#059669] font-bold uppercase tracking-widest text-sm">Official Student Gateway</p>
          </div>
        </div>

        <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group">
            <Link href="/p/results" className="block">
              <CardContent className="p-0 flex items-stretch">
                <div className="bg-[#1e40af] p-6 text-white flex items-center justify-center">
                  <Award className="h-8 w-8" />
                </div>
                <div className="flex-1 p-6 text-left bg-white flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">Academic Results</h3>
                    <p className="text-slate-500 text-sm font-medium">Check marks & rankings</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-[#1e40af] transition-colors" />
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group">
            <Link href="/p/ledger" className="block">
              <CardContent className="p-0 flex items-stretch">
                <div className="bg-[#059669] p-6 text-white flex items-center justify-center">
                  <Wallet className="h-8 w-8" />
                </div>
                <div className="flex-1 p-6 text-left bg-white flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">Financial Ledger</h3>
                    <p className="text-slate-500 text-sm font-medium">View payments & balance</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-[#059669] transition-colors" />
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        <div className="pt-8 border-t border-slate-200 animate-in fade-in duration-1000 delay-700">
          <div className="flex flex-col items-center gap-4">
            <Button variant="outline" asChild className="rounded-full border-2 font-bold px-8 h-12 hover:bg-slate-900 hover:text-white transition-all">
              <Link href="https://www.saathsamundri.com/">
                <Globe className="mr-2 h-4 w-4" />
                Back to Website
              </Link>
            </Button>
            <Link href="/login" className="text-slate-400 hover:text-[#1e40af] text-sm font-bold transition-colors">
              Academy Staff Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
