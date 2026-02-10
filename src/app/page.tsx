
'use client';

import { useEffect, useState } from 'react';
import { useTeacherAuth } from '@/hooks/use-teacher-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, Facebook, Instagram, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence, signOut } from 'firebase/auth';
import { getSettings } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import { ForgotPasswordDialog } from '@/components/login-form';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import Image from 'next/image';

const ADMIN_UID = "oiNKNvX9sQbdgjhxMP71eSiGkkH2";

export default function LoginPage() {
    const [loginType, setLoginType] = useState<'admin' | 'teacher'>('admin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isAdminLoading, setIsAdminLoading] = useState(false);
    const { login: teacherLogin, loading: isTeacherLoading } = useTeacherAuth();
    
    const router = useRouter();
    const { toast } = useToast();

    const handleAdminLogin = async () => {
        setIsAdminLoading(true);
        try {
            await setPersistence(auth, browserSessionPersistence);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (user.uid !== ADMIN_UID) {
                await signOut(auth);
                toast({ variant: 'destructive', title: 'ACCESS DENIED', description: 'YOU DO NOT HAVE PERMISSION TO ACCESS THE ADMIN PANEL.' });
                return;
            }

            const details = await getSettings('details');
            if (details) sessionStorage.setItem('cachedSettings', JSON.stringify(details));
            
            toast({ title: 'LOGIN SUCCESSFUL', description: 'WELCOME BACK, ADMIN!' });
            router.push('/dashboard');
        } catch (error: any) {
            let errorMessage = 'AN UNEXPECTED ERROR OCCURRED.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMessage = 'INVALID EMAIL OR PASSWORD.';
            }
            toast({ variant: 'destructive', title: 'LOGIN FAILED', description: errorMessage });
        } finally {
            setIsAdminLoading(false);
        }
    };

    const handleTeacherLogin = async () => {
        const result = await teacherLogin(email, password);
        if (!result.success) {
            toast({ variant: 'destructive', title: 'LOGIN FAILED', description: result.message.toUpperCase() });
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

    const isLoading = isAdminLoading || isTeacherLoading;

    return (
        <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
            {/* Animated Background Ingredients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse delay-700" />
            </div>

            <div className="w-full max-w-4xl rounded-3xl bg-card border border-slate-800 shadow-2xl overflow-hidden grid md:grid-cols-2 relative z-10">
                {/* Left Side: Branding (Hidden on Mobile) */}
                <div className="relative hidden md:block group">
                    <Image
                        src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwbGVhcm5pbmd8ZW58MHx8fHwxNzYxNDU1NTU2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="Students learning"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                    <div className="absolute bottom-12 left-8 right-8 text-white">
                        <h1 className="text-4xl font-black tracking-tight leading-none mb-2">
                            SAATH &nbsp; ACADEMY &nbsp; SAMUNDRI
                        </h1>
                        <p className="text-slate-300 font-medium tracking-wide">SHAPING FUTURES, EMPOWERING MINDS.</p>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="p-8 sm:p-12 flex flex-col justify-center">
                    <div className="mb-10 text-center md:hidden">
                        <div className="h-20 w-20 mx-auto mb-4">
                            <Logo noText={true} />
                        </div>
                        <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
                            SAATH &nbsp; ACADEMY &nbsp; SAMUNDRI
                        </h2>
                    </div>
                    
                    <div className="flex justify-center mb-8">
                        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex gap-1 shadow-inner">
                            <Button 
                                onClick={() => setLoginType('admin')} 
                                variant={loginType === 'admin' ? 'default' : 'ghost'} 
                                className={cn("rounded-xl px-6 font-bold transition-all", loginType === 'admin' ? 'bg-primary shadow-md' : 'text-slate-500')}
                            >
                                ADMIN
                            </Button>
                            <Button 
                                onClick={() => setLoginType('teacher')} 
                                variant={loginType === 'teacher' ? 'default' : 'ghost'} 
                                className={cn("rounded-xl px-6 font-bold transition-all", loginType === 'teacher' ? 'bg-primary shadow-md' : 'text-slate-500')}
                            >
                                TEACHER
                            </Button>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black tracking-tighter mb-2 uppercase">LOGIN</h2>
                        <p className="text-slate-500 font-medium uppercase text-xs tracking-widest">ENTER YOUR CREDENTIALS TO ACCESS PORTAL</p>
                    </div>
                    
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-bold text-xs uppercase tracking-widest ml-1">EMAIL ADDRESS</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder={`${loginType.toUpperCase()}@EXAMPLE.COM`} 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                className="h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-slate-950 dark:text-white"
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="font-bold text-xs uppercase tracking-widest ml-1">PASSWORD</Label>
                            <div className="relative">
                                <Input 
                                    id="password" 
                                    type={showPassword ? 'text' : 'password'} 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className="h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-slate-950 dark:text-white pr-12"
                                    required 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="text-right">
                            <ForgotPasswordDialog />
                        </div>
                        <Button type="submit" className="w-full h-12 rounded-xl font-black text-base shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            SIGN IN
                        </Button>
                    </form>
                </div>
            </div>

            <div className="mt-12 text-center relative z-10">
                <p className="text-slate-500 font-black text-xs tracking-[0.2em] uppercase">DEVELOPED BY MIAN MUDASSAR</p>
                <div className="mt-4 flex justify-center gap-6">
                    <Link href="https://www.facebook.com/mianmudassar.in" target="_blank" className="text-slate-400 hover:text-blue-600 transition-colors">
                        <Facebook className="h-5 w-5" />
                    </Link>
                    <Link href="https://api.whatsapp.com/send?phone=923099969535" target="_blank" className="text-slate-400 hover:text-emerald-500 transition-colors">
                        <MessageSquare className="h-5 w-5" />
                    </Link>
                    <Link href="https://www.instagram.com/mianmudassar_" target="_blank" className="text-slate-400 hover:text-pink-600 transition-colors">
                        <Instagram className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        </main>
    );
}
