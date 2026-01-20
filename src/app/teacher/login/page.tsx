
'use client';

import { useState, useEffect } from 'react';
import { useTeacherAuth } from '@/hooks/use-teacher-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';
import { ForgotPasswordDialog } from './forgot-password-dialog';
import { useSettings } from '@/hooks/use-settings';

export default function TeacherLoginPage() {
  const { login, loading } = useTeacherAuth();
  const { settings, isSettingsLoading } = useSettings();
  const { toast } = useToast();
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
    <main className="flex min-h-svh w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-4">
            <div className="mx-auto h-20 w-20">
                <Logo noText />
            </div>
          <CardTitle>Teacher Portal Login</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="teacher@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
          <ForgotPasswordDialog />
        </CardContent>
      </Card>
    </main>
  );
}
