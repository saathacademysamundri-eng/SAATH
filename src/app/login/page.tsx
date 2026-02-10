'use client';

import { useEffect, useState } from 'react';
import { useTeacherAuth } from '@/hooks/use-teacher-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, Facebook, Instagram, MessageSquare } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence, signOut } from 'firebase/auth';
import { getSettings } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import { ForgotPasswordDialog } from '@/components/login/forgot-password-dialog';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import Image from 'next/image';

const ADMIN_UID = "oiNKNvX9sQbdgjhxMP71eSiGkkH2";

export default function LoginPage() {
    const [isClient, setIsClient] = useState(false);
    const { settings, isSettingsLoading } = useSettings();
    const [loginType, setLoginType] = useState<'admin' | 'teacher'>('admin');
    
    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Loading states
    const [isAdminLoading, setIsAdminLoading] = useState(false);
    const { login: teacherLogin, loading: isTeacherLoading } = useTeacherAuth();
    
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
        if (!isSettingsLoading) {
            document.title = `Login | ${settings.name || 'Academy'}`;
        }
    }, [isSettingsLoading, settings.name]);

    const handleAdminLogin = async () => {
        setIsAdminLoading(true);
        try {
            await setPersistence(auth, browserSessionPersistence);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (user.uid !== ADMIN_UID) {
                await signOut(auth);
                toast({ variant: 'destructive', title: 'Access Denied', description: 'You do not have permission to access the admin panel.' });
                return;
            }

            const details = await getSettings('details');
            if (details) sessionStorage.setItem('cachedSettings', JSON.stringify(details));
            
            toast({ title: 'Login Successful', description: 'Welcome back, Admin!' });
            router.push('/dashboard');
        } catch (error: any) {
            let errorMessage = 'An unexpected error occurred.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMessage = 'Invalid email or password.';
            }
            toast({ variant: 'destructive', title: 'Login Failed', description: errorMessage });
        } finally {
            setIsAdminLoading(false);
        }
    };

    const handleTeacherLogin = async () => {
        const result = await teacherLogin(email, password);
        if (!result.success) {
            toast({ variant: 'destructive', title: 'Login Failed', description: result.message });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (loginType === 'admin') {
            handleAdminLogin();
        } else {
            handleTeacherLogin();
        }
    };

    const handleToggle = (type: 'admin' | 'teacher') => {
        setLoginType(type);
        setEmail('');
        setPassword('');
        setShowPassword(false);
    };
    
    if (!isClient) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    const isLoading = isAdminLoading || isTeacherLoading;

    return (
        <main className="min-h-screen bg-gray-100 dark:bg-gradient-to-r dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 dark:bg-[length:200%_200%] dark:animate-animated-gradient flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl rounded-2xl bg-card shadow-2xl overflow-hidden grid md:grid-cols-2">
                <div className="relative hidden md:block">
                    <Image
                        src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwbGVhcm5pbmd8ZW58MHx8fHwxNzYxNDU1NTU2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="Students learning in a classroom"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                <div className="p-8">
                    <div className="mb-8 text-center">
                        <div className="h-20 w-20 mx-auto">
                            <Logo noText={true} />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground uppercase mt-4 dark:text-white">
                            {settings.name}
                        </h2>
                    </div>
                    
                    <div className="flex justify-center mb-6">
                        <div className="bg-gray-200 dark:bg-slate-700 p-1 rounded-full flex gap-1">
                            <Button onClick={() => handleToggle('admin')} variant={loginType === 'admin' ? 'default' : 'ghost'} className={cn("rounded-full transition-all", loginType === 'admin' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>Admin</Button>
                            <Button onClick={() => handleToggle('teacher')} variant={loginType === 'teacher' ? 'default' : 'ghost'} className={cn("rounded-full transition-all", loginType === 'teacher' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>Teacher</Button>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-2">LOG IN</h2>
                    <p className="text-center text-muted-foreground mb-8">
                        Welcome back! Please sign in to continue.
                    </p>
                    
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" placeholder={`${loginType}@example.com`} value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </button>
                            </div>
                        </div>
                        <div className="text-right">
                            <ForgotPasswordDialog />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Log In
                        </Button>
                    </form>
                </div>
            </div>

            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>developed by mian mudassar</p>
                <div className="mt-2 flex justify-center gap-4">
                    <Link href="https://www.facebook.com/mianmudassar.in" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                        <Facebook className="h-4 w-4" />
                    </Link>
                    <Link href="https://api.whatsapp.com/send?phone=923099969535&text=Hye%20%0AI%20want%20to%20know%20about%20the%20software%20you%20created%2C%20which%20is%20a%20management%20system%20in%20the%20school.%20" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                        <MessageSquare className="h-4 w-4" />
                    </Link>
                    <Link href="https://www.instagram.com/mianmudassar_" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                        <Instagram className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </main>
    );
}
