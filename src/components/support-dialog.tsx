
'use client';

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useSettings } from '@/hooks/use-settings';
import { Button } from './ui/button';
import {
  Mail,
  Facebook,
  Instagram,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

export function SupportDialog() {
  const { settings } = useSettings();

  return (
    <DialogContent className="sm:max-w-lg bg-gray-900 text-white border-gray-800">
      <DialogHeader className="items-center text-center space-y-4">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-800 overflow-hidden border-2 border-gray-700">
          <img src="https://i.postimg.cc/25bFSj1P/Whats-App-Image-2025-11-07-at-2-10-20-PM.jpg" alt="Developer Logo" className="object-cover w-full h-full" />
        </div>
        <DialogTitle className="text-3xl font-bold uppercase tracking-tight">SUPPORT</DialogTitle>
        <DialogDescription className="text-sm text-gray-400 uppercase tracking-widest">
          CONTACT INFORMATION FOR THE SCHOOLUP PLATFORM.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 px-2 space-y-4 text-center text-gray-300 text-sm uppercase font-medium">
        <p>
          AT SCHOOLUP - A UNIQUE PLATFORM FOR SMART SCHOOLS, WE BELIEVE THAT
          EVERY QUESTION DESERVES A CLEAR ANSWER AND EVERY PROBLEM
          DESERVES A QUICK SOLUTION. OUR SUPPORT TEAM IS ALWAYS HERE TO
          GUIDE YOU.
        </p>
        <p>
          IF YOU EVER FACE ANY ISSUE, NEED DETAILED
          GUIDANCE, OR WANT TO UNLOCK THE FULL POTENTIAL OF OUR PLATFORM, OUR
          DEDICATED SUPPORT TEAM IS JUST A MESSAGE AWAY.
        </p>
      </div>
      <div className="flex justify-center">
        <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white text-base py-6 px-8 rounded-lg font-black uppercase shadow-xl shadow-purple-900/20">
          <a href="mailto:mianmudassar137@gmail.com">
            <Mail className="mr-2" />
            CONTACT SUPPORT VIA EMAIL
          </a>
        </Button>
      </div>
      <div className="border-t border-gray-800 mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-500 gap-4">
        <p className="text-center sm:text-left uppercase font-bold tracking-wider">SCHOOLUP – BECAUSE SMART SCHOOLS DESERVE A UNIQUE PLATFORM.</p>
        <div className="flex items-center gap-4 text-center sm:text-right">
          <p className="font-black uppercase tracking-widest">DEVELOPED BY MIAN MUDASSAR</p>
          <Link href="https://api.whatsapp.com/send?phone=923099969535" target="_blank" className="hover:text-white transition-colors"><MessageSquare className="h-4 w-4" /></Link>
          <Link href="https://www.facebook.com/mianmudassar.in" target="_blank" className="hover:text-white transition-colors"><Facebook className="h-4 w-4" /></Link>
          <Link href="https://www.instagram.com/mianmudassar_" target="_blank" className="hover:text-white transition-colors"><Instagram className="h-4 w-4" /></Link>
        </div>
      </div>
    </DialogContent>
  );
}
