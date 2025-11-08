
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase/config';
import { getSettings } from '@/lib/firebase/firestore';
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Set session persistence
      await setPersistence(auth, browserSessionPersistence);
      
      await signInWithEmailAndPassword(auth, email, password);

      // Fetch and cache settings on login
      const details = await getSettings('details');
      if (details) {
        sessionStorage.setItem('cachedSettings', JSON.stringify(details));
      }
      
      toast({
        title: 'Login Successful',
        description: 'Welcome back, Admin!',
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: (error as Error).message || 'An error occurred during login.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="grid gap-6" onSubmit={handleLogin}>
      <div className="grid gap-2">
        <Label htmlFor="email" className="text-gray-700">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-gray-100 dark:bg-gray-200 text-gray-900"
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-gray-700">Password</Label>
            <a
              href="#"
              className="text-sm font-medium text-primary hover:underline"
              tabIndex={-1}
              onClick={(e) => e.preventDefault()}
            >
              Forgot password?
            </a>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-gray-100 dark:bg-gray-200 text-gray-900"
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-orange-400 to-pink-500 py-3 text-base font-semibold text-white shadow-lg transition-all hover:from-orange-500 hover:to-pink-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
        disabled={isLoading}
        size="lg"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          'Log In'
        )}
      </Button>
    </form>
  );
}
