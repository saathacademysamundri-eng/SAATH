
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
      document.title = `Lock Screen | ${settings.name}`;
    }
  }, [isSettingsLoading, settings.name]);

  const handlePinChange = (value: string) => {
    setPin(value);
    if (value.length === 4) {
      if (unlock(value)) {
        toast({ title: 'System Unlocked' });
      } else {
        toast({ variant: 'destructive', title: 'Invalid PIN' });
        setPin('');
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (isSettingsLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-lg">
      <div className="flex w-full max-w-sm flex-col items-center rounded-2xl bg-card p-8 text-card-foreground shadow-2xl">
        <div className="mb-4 text-center">
          <div className="text-muted-foreground flex items-center justify-center gap-2">
            <LiveDate /> | <LiveTime />
          </div>
        </div>
        <div className="mb-4 h-20 w-20">
          <Logo noText />
        </div>
        <h1 className="mb-2 animate-breathe text-3xl font-bold">{settings.name}</h1>
        <p className="mb-6 text-muted-foreground">Enter Security PIN to Unlock</p>

        <InputOTP maxLength={4} value={pin} onChange={handlePinChange}>
          <InputOTPGroup>
            <InputOTPSlot index={0} isPin />
            <InputOTPSlot index={1} isPin />
            <InputOTPSlot index={2} isPin />
            <InputOTPSlot index={3} isPin />
          </InputOTPGroup>
        </InputOTP>

        <Button variant="link" className="mt-6" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout and login with email & password
        </Button>

        <div className="mt-8 w-full border-t pt-6 text-center">
          <p className="text-sm">{settings.address}</p>
          <p className="text-sm">{settings.phone}</p>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Developed by "Mian Mudassar"</p>
          <div className="mt-2 flex justify-center gap-4">
             <Link href="https://www.facebook.com/mianmudassar.in" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-4 w-4" />
            </Link>
             <Link href="https://api.whatsapp.com/send?phone=923099969535&text=Hye%20%0AI%20want%20to%20know%20about%20the%20software%20you%20created%2C%20which%20is%20a%20management%20system%20in%20the%20school.%20" target="_blank" rel="noopener noreferrer">
                <MessageSquare className="h-4 w-4" />
            </Link>
            <Link href="https://www.instagram.com/mianmudassar_" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
