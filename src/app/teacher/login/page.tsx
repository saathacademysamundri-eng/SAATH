
'use client';

import { useState, useEffect } from 'react';
import { useTeacherAuth } from '@/hooks/use-teacher-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Facebook, Instagram, MessageSquare } from 'lucide-react';
import { Logo } from '@/components/logo';
import { ForgotPasswordDialog } from './forgot-password-dialog';
import { useSettings } from '@/hooks/use-settings';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TeacherLoginPage() {
  const { login, loading } = useTeacherAuth();
  const { settings, isSettingsLoading } = useSettings();
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bgImageId, setBgImageId] = useState(1);

  useEffect(() => {
    setBgImageId(Math.floor(Math.random() * 1000) + 1);
    if (!isSettingsLoading) {
      document.title = `Teacher Login | ${settings.name || 'Academy Portal'}`;
    }
  }, [isSettingsLoading, settings.name]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (!result.success) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: result.message,
      });
    }
  };

  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="relative flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:h-auto md:min-h-[550px] md:flex-row animate-breathe">
        
        {/* Left Side - Login Form */}
        <div className="relative flex w-full flex-col justify-center p-8 md:w-1/2 lg:p-12 text-gray-900 dark:text-gray-900">
          <div className="relative z-10 mx-auto w-full max-w-sm">
            <div className="mb-8 text-center">
                <div className="mx-auto h-20 w-20">
                    <Logo noText onLogin />
                </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tighter text-gray-900">
                Teacher Portal
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Enter your credentials to access your dashboard.
              </p>
            </div>
             <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="teacher@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-100 dark:bg-gray-200 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                   className="bg-gray-100 dark:bg-gray-200 text-gray-900"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Logging in...' : 'Log In'}
              </Button>
            </form>
            <ForgotPasswordDialog />
            <div className="mt-4 flex flex-col items-center justify-center text-sm">
              <Button variant="link" onClick={() => router.push('/login')}>
                Are you an admin? Log in here.
              </Button>
            </div>
             <div className="mt-8 text-center text-sm text-gray-500">
              <p>Developed by "Mian Mudassar"</p>
              <div className="mt-2 flex justify-center gap-4">
                 <Link href="https://www.facebook.com/mianmudassar.in" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900">
                    <Facebook className="h-4 w-4" />
                </Link>
                 <Link href="https://api.whatsapp.com/send?phone=923099969535&text=Hye%20%0AI%20want%20to%20know%20about%20the%20software%20you%20created%2C%20which%20is%20a%20management%20system%20in%20the%20school.%20" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900">
                    <MessageSquare className="h-4 w-4" />
                </Link>
                <Link href="https://www.instagram.com/mianmudassar_" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900">
                    <Instagram className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="relative hidden w-1/2 items-center justify-center md:flex">
          <Image
            src={`https://picsum.photos/seed/${bgImageId}/800/1200`}
            alt="Abstract background"
            fill
            className="object-cover"
            data-ai-hint="teacher classroom"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/70 via-blue-600/50 to-indigo-600/50 mix-blend-multiply"></div>
           <div className="absolute inset-0 bg-black/20"></div>
        </div>
      </div>
    </main>
  );
}
