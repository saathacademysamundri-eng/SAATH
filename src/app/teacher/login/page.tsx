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
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TeacherLoginPage() {
  const { login, loading } = useTeacherAuth();
  const { settings, isSettingsLoading } = useSettings();
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
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
    <main className="flex min-h-svh w-full items-center justify-center p-4 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 animate-animated-gradient bg-[length:400%_400%]">
      <div className="w-full max-w-md space-y-8">
        <div className="rounded-2xl bg-white/10 p-8 shadow-2xl backdrop-blur-lg border border-white/20">
          <div className="mb-8 text-center text-white">
            <div className="mx-auto h-20 w-20">
              <Logo noText onLogin />
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tighter">
              Teacher Portal
            </h1>
            <p className="mt-1 text-sm text-gray-200">
              Enter your credentials to access your dashboard.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="teacher@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/20 text-white placeholder:text-gray-300 border-white/30 focus:bg-white/30 focus:ring-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/20 text-white placeholder:text-gray-300 border-white/30 focus:bg-white/30 focus:ring-white"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-white py-3 text-base font-semibold text-blue-600 shadow-lg transition-all hover:bg-gray-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 focus:ring-offset-blue-600" 
              disabled={loading}
              size="lg"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
          <ForgotPasswordDialog />
          <div className="mt-4 flex flex-col items-center justify-center text-sm">
            <Button variant="link" onClick={() => router.push('/login')} className="text-gray-200 hover:text-white">
              Are you an admin? Log in here.
            </Button>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-white/70">
          <p>Developed by "Mian Mudassar"</p>
          <div className="mt-2 flex justify-center gap-4">
              <Link href="https://www.facebook.com/mianmudassar.in" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                <Facebook className="h-4 w-4" />
            </Link>
              <Link href="https://api.whatsapp.com/send?phone=923099969535&text=Hye%20%0AI%20want%20to%20know%20about%20the%20software%20you%20created%2C%20which%20is%20a%20management%20system%20in%20the%20school.%20" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                <MessageSquare className="h-4 w-4" />
            </Link>
            <Link href="https://www.instagram.com/mianmudassar_" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                <Instagram className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
