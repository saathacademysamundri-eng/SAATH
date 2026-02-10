
'use client';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { LiveDate, LiveTime } from './live-date-time';
import { Logo } from './logo';
import { Button } from './ui/button';
import { LogOut, Facebook, Instagram, MessageSquare } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { useLock } from '@/hooks/use-lock';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function LockScreen() {
  const { settings, isSettingsLoading } = useSettings();
  const { unlock } = useLock();
  const { toast } = useToast();
  const router = useRouter();
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (!isSettingsLoading) {
      document.title = `LOCK SCREEN | ${settings.name.toUpperCase()}`;
    }
  }, [isSettingsLoading, settings.name]);

  const handlePinChange = (value: string) => {
    setPin(value);
    if (value.length === 4) {
      if (unlock(value)) {
        toast({ title: 'SYSTEM UNLOCKED' });
      } else {
        toast({ variant: 'destructive', title: 'INVALID PIN' });
        setPin('');
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (isSettingsLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl">
      <div className="flex w-full max-w-sm flex-col items-center rounded-3xl bg-card p-8 sm:p-10 text-card-foreground shadow-2xl border border-slate-800">
        <div className="mb-6 text-center">
          <div className="text-slate-400 font-black text-[10px] tracking-widest flex items-center justify-center gap-2 uppercase">
            <LiveDate /> | <LiveTime />
          </div>
        </div>
        <div className="mb-6 h-20 w-20">
          <Logo noText />
        </div>
        <h1 className="mb-2 animate-breathe text-2xl sm:text-3xl font-black uppercase tracking-tight text-center leading-none">
            {settings.name}
        </h1>
        <p className="mb-8 text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">ENTER SECURITY PIN TO UNLOCK</p>

        <InputOTP maxLength={4} value={pin} onChange={handlePinChange}>
          <InputOTPGroup>
            <InputOTPSlot index={0} isPin />
            <InputOTPSlot index={1} isPin />
            <InputOTPSlot index={2} isPin />
            <InputOTPSlot index={3} isPin />
          </InputOTPGroup>
        </InputOTP>

        <Button variant="link" className="mt-8 text-slate-400 font-bold uppercase text-[10px] tracking-wider" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          LOGOUT AND SIGN IN AGAIN
        </Button>

        <div className="mt-8 w-full border-t border-slate-800 pt-8 text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{settings.address}</p>
          <p className="text-[10px] font-black text-slate-400">{settings.phone}</p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">DEVELOPED BY MIAN MUDASSAR</p>
          <div className="mt-4 flex justify-center gap-6">
             <Link href="https://www.facebook.com/mianmudassar.in" target="_blank" className="text-slate-600 hover:text-white transition-colors">
                <Facebook className="h-4 w-4" />
            </Link>
             <Link href="https://api.whatsapp.com/send?phone=923099969535" target="_blank" className="text-slate-600 hover:text-white transition-colors">
                <MessageSquare className="h-4 w-4" />
            </Link>
            <Link href="https://www.instagram.com/mianmudassar_" target="_blank" className="text-slate-600 hover:text-white transition-colors">
                <Instagram className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
