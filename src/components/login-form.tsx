'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function LoginForm() {
  const { toast } = useToast();

  const handleLogin = () => {
    toast({
      title: 'Login Successful',
      description: 'Welcome back, Admin!',
    });
  };

  return (
    <form className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@example.com"
          defaultValue="admin@example.com"
          required
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="password">Password</Label>
          <Link
            href="#"
            className="ml-auto inline-block text-sm underline"
            tabIndex={-1}
          >
            Forgot your password?
          </Link>
        </div>
        <Input id="password" type="password" defaultValue="password" required />
      </div>
      <Button asChild className="w-full" onClick={handleLogin}>
        <Link href="/dashboard">
          Login
          <ArrowRight />
        </Link>
      </Button>
    </form>
  );
}
