
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase/config';
import { getSettings } from '@/lib/firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
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
    <form className="grid gap-8" onSubmit={handleLogin}>
      <div className="relative">
        <Input
          id="email"
          type="email"
          placeholder=" " // Required for the label animation
          className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-primary"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Label
          htmlFor="email"
          className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-base text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-primary dark:text-gray-400 peer-focus:dark:text-primary"
        >
          Email Address
        </Label>
      </div>
      <div className="relative">
        <Input
          id="password"
          type="password"
          placeholder=" " // Required for the label animation
          className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-primary"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Label
          htmlFor="password"
          className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-base text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-primary dark:text-gray-400 peer-focus:dark:text-primary"
        >
          Password
        </Label>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
           {/* Checkbox can be added here if needed */}
        </div>
        <a
          href="#"
          className="text-sm font-medium text-primary hover:underline"
          tabIndex={-1}
          onClick={(e) => e.preventDefault()}
        >
          Forgot password?
        </a>
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
