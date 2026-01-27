
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase/config';
import { getSettings } from '@/lib/firebase/firestore';
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence, signOut } from 'firebase/auth';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ForgotPasswordDialog } from './forgot-password-dialog';

const ADMIN_UID = "oiNKNvX9sQbdgjhxMP71eSiGkkH2";

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
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.uid !== ADMIN_UID) {
        await signOut(auth);
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'You do not have permission to access the admin panel.',
        });
        setIsLoading(false);
        return;
      }

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
    } catch (error: any) {
      console.error('Login failed:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.code) {
        switch(error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                errorMessage = 'Invalid email or password. Please try again.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'The email address you entered is not valid.';
                break;
            default:
                errorMessage = 'Could not log you in. Please check your connection and try again.';
                break;
        }
      }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="grid gap-6" onSubmit={handleLogin}>
      <div className="grid gap-2">
        <Label htmlFor="email" className="text-gray-200">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-white/20 text-white placeholder:text-gray-300 border-white/30 focus:bg-white/30 focus:ring-white"
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-gray-200">Password</Label>
            <ForgotPasswordDialog />
        </div>
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
        className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 py-3 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900"
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
